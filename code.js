/**
 * =========================================================================
 * GOOGLE APPS SCRIPT BACKEND FOR POLLING STATION PHYSICAL VERIFICATION
 * मतदेय स्थलों के भौतिक सत्यापन हेतु गूगल ऐप स्क्रिप्ट (code.js)
 * =========================================================================
 * 
 * निर्देश (DEPLOYMENT STEPS):
 * 1. Google Sheets खोलें (New Spreadsheet: https://sheets.new)
 * 2. Extensions (एक्सटेंशन) -> Apps Script पर क्लिक करें
 * 3. इस फाइल (code.js) के संपूर्ण कोड को Apps Script एडिटर (Code.gs) में पेस्ट करें
 * 4. ऊपर 'Save' (डिस्क आइकॉन) पर क्लिक करें
 * 5. पहली बार 'setupInitialSheets' फंक्शन चुनकर 'Run' करें (यह शीट, हेडर और Status कॉलम स्वतः बना देगा)
 * 6. ऊपर दाईं ओर Deploy (तैनात करें) -> Manage deployments (यदि पहले से है) या New deployment पर क्लिक करें
 * 7. Select type -> Web app चुनें:
 *    - Execute as: Me (मेरी ईमेल आईडी)
 *    - Who has access: Anyone (कोई भी व्यक्ति)  <-- यह अत्यंत आवश्यक है!
 * 8. Deploy पर क्लिक करें
 * =========================================================================
 */

var SHEET_NAME_VERIFICATION = "VerificationData";
var SHEET_NAME_MASTER_BOOTHS = "MasterBooths";

/**
 * GET Request Handler - डेटा प्राप्त करने के लिए
 * Examples:
 * ?action=getAll
 * ?action=getBooth&boothNo=3
 * ?action=getMasterBooths
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "getAll";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ensure sheets exist and Status is synchronized
    ensureSheetsExist(ss);
    updateMasterBoothsStatus(ss);

    if (action === "getMasterBooths") {
      var masterSheet = ss.getSheetByName(SHEET_NAME_MASTER_BOOTHS);
      var masterData = getRowsAsObjects(masterSheet);
      return createJsonResponse({
        status: "success",
        data: masterData
      });
    }

    if (action === "getBooth") {
      var boothNo = params.boothNo;
      if (!boothNo) {
        return createJsonResponse({ status: "error", message: "Booth number is required" });
      }
      var verSheet = ss.getSheetByName(SHEET_NAME_VERIFICATION);
      var allRecords = getRowsAsObjects(verSheet);
      var matched = null;
      for (var i = 0; i < allRecords.length; i++) {
        if (String(allRecords[i].boothNo).trim() === String(boothNo).trim()) {
          matched = allRecords[i];
          break;
        }
      }
      return createJsonResponse({
        status: "success",
        exists: !!matched,
        data: matched
      });
    }

    // Default: Return both verification records and master booths
    var vSheet = ss.getSheetByName(SHEET_NAME_VERIFICATION);
    var mSheet = ss.getSheetByName(SHEET_NAME_MASTER_BOOTHS);

    var verifications = getRowsAsObjects(vSheet);
    var masterBooths = getRowsAsObjects(mSheet);

    return createJsonResponse({
      status: "success",
      verifications: verifications,
      masterBooths: masterBooths,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * POST Request Handler - डेटा सुरक्षित (Save) अथवा अपडेट (Update) करने के लिए
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait for up to 30 seconds for concurrent requests
    lock.waitLock(30000);

    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Fallback for form-encoded data
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var boothNo = String(payload.boothNo || "").trim();
    if (!boothNo) {
      return createJsonResponse({
        status: "error",
        message: "मतदेय स्थल संख्या (Booth No) अनिवार्य है।"
      });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetsExist(ss);
    var sheet = ss.getSheetByName(SHEET_NAME_VERIFICATION);

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Find index of Booth No column (Column B / index 1 by default: "मतदेय स्थल सं०")
    var boothColIndex = -1;
    for (var c = 0; c < headers.length; c++) {
      var headerText = String(headers[c]).toLowerCase();
      if (headerText.indexOf("मतदेय स्थल सं०") !== -1 || headerText.indexOf("booth no") !== -1 || headerText === "boothno") {
        boothColIndex = c;
        break;
      }
    }
    if (boothColIndex === -1) {
      boothColIndex = 1; // Default to 2nd column
    }

    // Format current timestamp
    var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "yyyy-MM-dd HH:mm:ss");

    var existingRowIndex = -1;
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][boothColIndex]).trim() === boothNo) {
        existingRowIndex = r + 1; // 1-based row index in sheet
        break;
      }
    }

    var isUpdate = existingRowIndex > 0;
    var serialNo = isUpdate ? data[existingRowIndex - 1][0] : (data.length); // S.No

    // Prepare row array matching official 16 columns + extra metadata
    var rowData = [
      serialNo,                                       // 1: क्र०सं०
      payload.boothNo,                                // 2: मतदेय स्थल सं०
      payload.boothName || "",                        // 2: मतदेय स्थल का नाम
      payload.roomCount || "",                        // 3: कमरों की संख्या
      payload.buildingConditionProper || (payload.buildingCondition === "सही" ? "सही" : ""), // 4: भवन की स्थिति - सही
      payload.buildingConditionDilapidated || (payload.buildingCondition === "जीर्णशीर्ण" ? "जीर्णशीर्ण" : ""), // 5: भवन की स्थिति - जीर्णशीर्ण
      payload.mergedSchoolStatus || "लागू नहीं",      // 6: मर्ज प्राथमिक विद्यालय स्थिति
      payload.doorsCount || "",                       // 7: कमरों में दरवाजों की स्थिति
      payload.waterAvailable || "नहीं",               // 8: पानी की उपलब्धता
      payload.toiletAvailable || "नहीं",              // 9: शौचालय की उपलब्धता
      payload.waitingRoomShade || "नहीं",             // 10: वेटिंग रूम/छाया की व्यवस्था
      payload.electricityAvailable || "नहीं",         // 11: विद्युत व्यवस्था
      payload.furnitureAvailable || "नहीं",           // 12: फर्नीचर की व्यवस्था
      payload.rampAvailable || "नहीं",                // 13: रैम्प की उपलब्धता
      payload.roadCondition || "",                    // 14: सड़क मार्ग की स्थिति
      payload.departmentName || "बेसिक शिक्षा विभाग", // 15: विभाग का नाम
      payload.developmentBlock || "",                 // 16: विकास खण्ड का नाम
      payload.assemblyConstituency || "",             // विधान सभा निर्वाचन क्षेत्र
      payload.tehsilName || "",                       // तहसील का नाम
      payload.bloName || "",                          // बीएलओ नाम
      payload.bloMobile || "",                        // बीएलओ मोबाइल
      payload.supervisorName || "",                   // सुपरवाइजर नाम
      payload.supervisorMobile || "",                 // सुपरवाइजर मोबाइल
      nowStr                                          // अंतिम अपडेट दिनांक/समय
    ];

    if (isUpdate) {
      // Update existing row
      sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Append new row
      sheet.appendRow(rowData);
    }

    // Auto-update the "Status" column in MasterBooths sheet ("Complete" or "Pending")
    updateMasterBoothsStatus(ss);

    return createJsonResponse({
      status: "success",
      action: isUpdate ? "updated" : "saved",
      isUpdate: isUpdate,
      boothNo: boothNo,
      message: isUpdate 
        ? "मतदेय स्थल संख्या " + boothNo + " का डेटा सफलतापूर्वक अपडेट (Update) कर दिया गया है।" 
        : "मतदेय स्थल संख्या " + boothNo + " का सत्यापन डेटा सफलतापूर्वक सुरक्षित (Save) हो गया है।",
      record: payload,
      updatedAt: nowStr
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: "त्रुटि: " + err.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Automatically updates or fills the "Status" column in the "MasterBooths" sheet.
 * Status is set to "Complete" if the booth number is present in "मतदेय स्थल सं०"
 * in the "VerificationData" sheet; otherwise "Pending".
 */
function updateMasterBoothsStatus(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var vSheet = ss.getSheetByName(SHEET_NAME_VERIFICATION);
  var mSheet = ss.getSheetByName(SHEET_NAME_MASTER_BOOTHS);
  if (!vSheet || !mSheet) return;

  // 1. Collect all verified booth numbers from VerificationData sheet
  var vData = vSheet.getDataRange().getValues();
  var verifiedBooths = {};
  if (vData.length > 1) {
    var vHeaders = vData[0];
    var vBoothColIdx = 1; // Default Col B (मतदेय स्थल सं०)
    for (var c = 0; c < vHeaders.length; c++) {
      var hText = String(vHeaders[c]).trim();
      if (hText === "मतदेय स्थल सं०" || hText.indexOf("मतदेय स्थल सं०") !== -1 || hText.toLowerCase() === "booth no") {
        vBoothColIdx = c;
        break;
      }
    }
    for (var r = 1; r < vData.length; r++) {
      var bNum = String(vData[r][vBoothColIdx]).trim();
      if (bNum) {
        verifiedBooths[bNum] = true;
      }
    }
  }

  // 2. Identify "Status" column in MasterBooths sheet
  var mData = mSheet.getDataRange().getValues();
  if (mData.length === 0) return;
  var mHeaders = mData[0];
  var statusColIdx = -1;
  var mBoothColIdx = 0; // Col A (Booth No)

  for (var j = 0; j < mHeaders.length; j++) {
    var mHeader = String(mHeaders[j]).trim().toLowerCase();
    if (mHeader === "status" || mHeader === "स्थिति") {
      statusColIdx = j;
    }
    if (mHeader === "booth no" || mHeader === "boothno" || mHeader.indexOf("मतदेय स्थल") !== -1) {
      mBoothColIdx = j;
    }
  }

  // If "Status" header does not exist, append it
  if (statusColIdx === -1) {
    statusColIdx = mHeaders.length;
    mSheet.getRange(1, statusColIdx + 1).setValue("Status").setFontWeight("bold").setBackground("#fed7aa");
  }

  // 3. Set "Complete" or "Pending" with colors: "Complete" in GREEN, "Pending" in ORANGE
  if (mData.length > 1) {
    var statusValues = [];
    var bgColors = [];
    var fontColors = [];

    for (var i = 1; i < mData.length; i++) {
      var mBoothNum = String(mData[i][mBoothColIdx]).trim();
      if (mBoothNum && verifiedBooths[mBoothNum]) {
        statusValues.push(["Complete"]);
        bgColors.push(["#dcfce7"]); // Soft green background
        fontColors.push(["#15803d"]); // Bold green text
      } else {
        statusValues.push(["Pending"]);
        bgColors.push(["#ffedd5"]); // Soft orange background
        fontColors.push(["#c2410c"]); // Bold orange text
      }
    }
    var statusRange = mSheet.getRange(2, statusColIdx + 1, statusValues.length, 1);
    statusRange.setValues(statusValues);
    statusRange.setBackgrounds(bgColors);
    statusRange.setFontColors(fontColors);
    statusRange.setFontWeight("bold");
    statusRange.setHorizontalAlignment("center");
  }
}

/**
 * Creates JSON output with proper CORS headers for Web applications
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper to convert sheet rows into array of objects with keys matching header names
 */
function getRowsAsObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = toCamelCaseKey(headers[j]);
      obj[key] = row[j];
    }
    // Standard keys mapping
    if (sheet.getName() === SHEET_NAME_VERIFICATION) {
      obj.boothNo = String(row[1] || "").trim();
      obj.boothName = row[2] || "";
      obj.roomCount = row[3] || "";
      obj.buildingCondition = row[4] === "सही" ? "सही" : (row[5] === "जीर्णशीर्ण" ? "जीर्णशीर्ण" : (row[4] || row[5] || ""));
      obj.mergedSchoolStatus = row[6] || "";
      obj.doorsCount = row[7] || "";
      obj.waterAvailable = row[8] || "नहीं";
      obj.toiletAvailable = row[9] || "नहीं";
      obj.waitingRoomShade = row[10] || "नहीं";
      obj.electricityAvailable = row[11] || "नहीं";
      obj.furnitureAvailable = row[12] || "नहीं";
      obj.rampAvailable = row[13] || "नहीं";
      obj.roadCondition = row[14] || "";
      obj.departmentName = row[15] || "";
      obj.developmentBlock = row[16] || "";
      obj.assemblyConstituency = row[17] || "";
      obj.tehsilName = row[18] || "";
      obj.bloName = row[19] || "";
      obj.bloMobile = row[20] || "";
      obj.supervisorName = row[21] || "";
      obj.supervisorMobile = row[22] || "";
      obj.updatedAt = row[23] || "";
    } else if (sheet.getName() === SHEET_NAME_MASTER_BOOTHS) {
      obj.boothNo = String(row[0] || "").trim();
      obj.boothName = row[1] || "";
      obj.bloName = row[2] || "";
      obj.bloDesignation = row[3] || "";
      obj.bloMobile = row[4] || "";
      obj.supervisorName = row[5] || "";
      obj.supervisorDesignation = row[6] || "";
      obj.supervisorMobile = row[7] || "";
      obj.status = row[8] || "Pending";
    }
    results.push(obj);
  }

  return results;
}

function toCamelCaseKey(str) {
  var cleaned = String(str || "").replace(/[^a-zA-Z0-9]/g, " ").trim();
  if (!cleaned) return "col";
  var parts = cleaned.split(/\s+/);
  var key = parts[0].toLowerCase();
  for (var p = 1; p < parts.length; p++) {
    key += parts[p].charAt(0).toUpperCase() + parts[p].slice(1).toLowerCase();
  }
  return key;
}

/**
 * Setup Function: Run this function once from the Apps Script editor to initialize sheets with headers, master data, and Status
 */
function setupInitialSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetsExist(ss);
  updateMasterBoothsStatus(ss);
  SpreadsheetApp.getUi().alert("सत्यापन शीट, मास्टर बूथ डायरेक्टरी एवं ऑटो 'Status' (Complete/Pending) कॉलम सफलतापूर्वक तैयार कर दिए गए हैं!");
}

function ensureSheetsExist(ss) {
  // 1. Verification Data Sheet
  var vSheet = ss.getSheetByName(SHEET_NAME_VERIFICATION);
  if (!vSheet) {
    vSheet = ss.insertSheet(SHEET_NAME_VERIFICATION);
    var vHeaders = [
      "क० सं०",
      "मतदेय स्थल सं०",
      "मतदेय स्थल का नाम",
      "कमरों की उपलब्धता / संख्या",
      "भवन की स्थिति (सही)",
      "भवन की स्थिति (जीर्णशीर्ण)",
      "मर्ज प्राथमिक विद्यालय की स्थिति",
      "कमरों में दरवाजों की स्थिति",
      "पानी की उपलब्धता (हाँ/नहीं)",
      "शौचालय की उपलब्धता (हाँ/नहीं)",
      "वेटिंग रूम/छाया की व्यवस्था (हाँ/नहीं)",
      "विद्युत व्यवस्था (हाँ/नहीं)",
      "फर्नीचर की व्यवस्था (हाँ/नहीं)",
      "रैम्प की उपलब्धता (हाँ/नहीं)",
      "सड़क मार्ग की स्थिति",
      "विभाग का नाम",
      "विकास खण्ड का नाम",
      "विधान सभा क्षेत्र",
      "तहसील",
      "बी०एल०ओ० नाम",
      "बी०एल०ओ० मोबाइल",
      "सुपरवाइजर नाम",
      "सुपरवाइजर मोबाइल",
      "अंतिम अपडेट दिनांक"
    ];
    vSheet.getRange(1, 1, 1, vHeaders.length).setValues([vHeaders]);
    vSheet.getRange(1, 1, 1, vHeaders.length).setFontWeight("bold").setBackground("#e2e8f0");
    vSheet.setFrozenRows(1);
  }

  // 2. Master Booths Sheet
  var mSheet = ss.getSheetByName(SHEET_NAME_MASTER_BOOTHS);
  if (!mSheet) {
    mSheet = ss.insertSheet(SHEET_NAME_MASTER_BOOTHS);
    var mHeaders = [
      "Booth No",
      "Booth Name",
      "Blo Name",
      "Designation",
      "Mobile No",
      "Supervisor Name",
      "Designation",
      "Mobile No",
      "Status"
    ];
    mSheet.getRange(1, 1, 1, mHeaders.length).setValues([mHeaders]);
    mSheet.getRange(1, 1, 1, mHeaders.length).setFontWeight("bold").setBackground("#fed7aa");
    mSheet.setFrozenRows(1);

    // Initial booths from Image 2 with initial "Pending" status
    var initialBooths = [
      [1, "PRIMARY SCHOOL GHOSIPURA ROOM NO-1", "Sharda Saini", "Aww", "8923567585", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [2, "PRIMARY SCHOOL GHOSIPURA ROOM NO-2", "Vinit kumar", "AT", "9634121416", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [3, "PRIMARY SCHOOL ALIGANJ PATTIKALA", "kapil kumar saxena", "AT", "9412137986", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [4, "PRIMARY SCHOOL MILAK NOKHARID ROOM NO-1", "Meena Yadav", "Aww", "9837239046", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [5, "PRIMARY SCHOOL MILAK NOKHARID ROOM NO-2", "Poonam Saini", "AT", "9758085063", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [6, "PRIMARY SCHOOL KAREEMPUR", "PAWAN PAL", "PS", "8941976795", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [7, "PRIMARY SCHOOL HASANPUR UTTARI", "Gita Rani", "CT", "9675577363", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [8, "PRIMARY SCHOOL SHEKHUPURA", "priyanka", "Aww", "7055560770", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [9, "JUNIOR HIGH SCHOOL LADPUR SEMRA ROOM NO-1", "Satyaprakash", "AT", "8859328346", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [10, "JUNIOR HIGH SCHOOL LADPUR SEMRA ROOM NO-2", "Harkesh Kumar", "AT", "9758035102", "Dharmendra Kumar", "LP", "7017939578", "Pending"],
      [11, "PRIMARY SCHOOL KISHANPUR MOLAGAD", "Kamaljeet Singh", "CT", "8057965670", "Ankit Kumar", "LP", "9759524426", "Pending"],
      [12, "PRIMARY SCHOOL KISHANPUR MOLAGARH ROOM NO 2", "Harpal Singh", "CT", "9917178353", "Ankit Kumar", "LP", "9759524426", "Pending"],
      [13, "COMPOSITE SCHOOL DHARAMPUR UTTARI", "Gopal Singh", "AT", "9719446364", "Ankit Kumar", "LP", "9759524426", "Pending"],
      [14, "COMPOSITE SCHOOL MANPUR UTTARI ROOM NO-1", "Amrit Pal Singh", "CT", "9927777040", "Ankit Kumar", "LP", "9759524426", "Pending"],
      [15, "COMPOSITE SCHOOL MANPUR UTTARI ROOM NO-2", "Gurjeet Kaur", "Aww", "9690575742", "Ankit Kumar", "LP", "9759524426", "Pending"]
    ];

    mSheet.getRange(2, 1, initialBooths.length, 9).setValues(initialBooths);
  }
}
