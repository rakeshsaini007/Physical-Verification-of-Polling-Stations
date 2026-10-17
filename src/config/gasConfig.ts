/**
 * =========================================================================
 * GOOGLE APPS SCRIPT WEB APP CONFIGURATION
 * मतदेय स्थल भौतिक सत्यापन - गूगल ऐप स्क्रिप्ट वेब ऐप यूआरएल कॉन्फ़िगरेशन
 * =========================================================================
 * 
 * 📌 निर्देश (INSTRUCTIONS):
 * 1. Google Sheets में code.js पेस्ट करने और Deploy (Web app - Anyone access) करने के बाद,
 *    आपको जो Web app URL प्राप्त होगा (e.g. https://script.google.com/macros/s/AKfycb.../exec)
 * 2. उस URL को नीचे दिए गए GOOGLE_APPS_SCRIPT_URL चर (variable) में पेस्ट करें।
 * 3. जब तक आप वास्तविक URL नहीं डालते, यह ऐप सुरक्षित रूप से लोकल स्टोरेज (Local Fallback)
 *    में काम करेगा ताकि आप तुरंत सभी फीचर्स का परीक्षण कर सकें।
 */

// 👇👇👇 ENTER YOUR GOOGLE APPS SCRIPT DEPLOYED WEB APP URL HERE 👇👇👇
export const GOOGLE_APPS_SCRIPT_URL: string = "https://script.google.com/macros/s/AKfycbxpSiRmSL6MKz2RgHsCvhZF5k4BhOcPdkszjwCzRJQlcSGcgYbZiG_hRoxj61chu7kg/exec";

// Assembly & Tehsil Defaults (can also be changed dynamically in the form)
export const DEFAULT_ASSEMBLY_CONSTITUENCY = "34 - स्वार (विधान सभा निर्वाचन क्षेत्र)";
export const DEFAULT_TEHSIL_NAME = "स्वार";
export const DEFAULT_DISTRICT_NAME = "रामपुर";
export const DEFAULT_DEPARTMENT_NAME = "बेसिक शिक्षा विभाग";
