import React, { useState, useEffect } from "react";
import '../css/stores.css';


export default function Stores() {
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [businessType, setBusinessType] = useState("Retail");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [storeAddress, setStoreAddress] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [storeSaved, setStoreSaved] = useState(false);
  const [storeId, setSavedStoreId] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const existingStoreId = localStorage.getItem("storeId");
    if (existingStoreId) {
      setStoreSaved(true);
      setSavedStoreId(existingStoreId);
      setIsEditing(false);
    }
  }, []);

  useEffect(() => {
    setSlug(storeName.trim().toLowerCase().replace(/\s+/g, "-"));
  }, [storeName]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const storedEmail = localStorage.getItem("userEmail");
  if (!storedEmail) {
    alert("User email not found. Please log in again.");
    return;
  }

  setEmail(storedEmail);

  const formData = new FormData();
  formData.append('store_name', storeName);
  formData.append('slug', slug);
  formData.append('description', description);
  formData.append('store_email', storedEmail);
  formData.append('store_address', storeAddress);
  formData.append('password', password);
  formData.append('facebook', facebook);
  formData.append('instagram', instagram);
  formData.append('theme', theme);
  formData.append('primary_color', primaryColor);
  formData.append('currency', currency);
  formData.append('timezone', timezone);
  formData.append('business_type', businessType);
  if (logo) formData.append('logo', logo);
  if (bannerImage) formData.append('banner_image', bannerImage);

  const existingStoreId = localStorage.getItem('storeId');
  const isUpdating = !!existingStoreId;
  const url = isUpdating
    ? `http://localhost:5000/api/stores_backup/${existingStoreId}`
    : 'http://localhost:5000/api/stores_backup';
  const method = isUpdating ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (!isUpdating) {
      localStorage.setItem("storeId", result.id); // assuming `result.id` is the new store ID
      setSavedStoreId(result.id);
    }

    setStoreSaved(true);
    setIsEditing(false);
    setPopupMessage("✅ Store saved successfully!");
    setShowPopup(true);

    setTimeout(() => setShowPopup(false), 3000);
  } catch (err) {
    console.error("❌ Error saving store:", err);
    alert("Failed to save store. Check console for details.");
  }
};


  const shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    R = Math.min(255, parseInt((R * (100 + percent)) / 100));
    G = Math.min(255, parseInt((G * (100 + percent)) / 100));
    B = Math.min(255, parseInt((B * (100 + percent)) / 100));
    return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`;

    
  };

  return (
    <div className="store-setup-wrapper max-w-4xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="store-form">
        <h2 className="text-3xl font-bold text-center">🛍️ Store Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Store Name</label>
            <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required className="w-full p-2 border rounded" disabled={!isEditing}/>
          </div>
          <div>
            <label className="block font-medium mb-1">Store Slug (URL)</label>
            <input type="text" value={slug} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" disabled={!isEditing} />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Store Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full p-2 border rounded" placeholder="What does your store sell?" disabled={!isEditing}/>
          </div>
          <div>
            <label className="block font-medium mb-1">Contact Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" disabled={!isEditing}/>
          </div>
          <div>
            <label className="block font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Enter a secure password"disabled={!isEditing} />
          </div>
          <div>
            <label className="block font-medium mb-1">Business Type</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full p-2 border rounded" disabled={!isEditing}>
              <option>Retail</option>
              <option>Wholesale</option>
              <option>Digital Products</option>
              <option>Services</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full p-2 border rounded"disabled={!isEditing}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Time Zone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full p-2 border rounded"disabled={!isEditing}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Kolkata">India</option>
              <option value="Asia/Tokyo">Japan</option>
            </select>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mt-2">🕒 Current Time in {timezone}: {currentTime.toLocaleString("en-US", { timeZone: timezone })}</p>
          </div>
          <div>
            <label className="block font-medium mb-1">Facebook URL</label>
            <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="w-full p-2 border rounded"disabled={!isEditing} />
          </div>
          <div>
            <label className="block font-medium mb-1">Instagram URL</label>
            <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full p-2 border rounded" disabled={!isEditing}/>
          </div>
          <div>
            <label className="block font-medium mb-1">Store Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full p-2 border rounded bg-white" disabled={!isEditing}/>
            {logoPreview && <img src={logoPreview} alt="Logo" className="mt-2 h-20 rounded shadow-md" />}
          </div>
          <div className="md:col-span-2">
  <label className="block font-medium mb-1">Store Address</label>
  <input
    type="text"
    value={storeAddress}
    onChange={(e) => setStoreAddress(e.target.value)}
    className="w-full p-2 border rounded"
    placeholder="Enter your store's physical address"
  />

  <label className="block font-medium mb-1" >Banner Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      setBannerImage(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setBannerPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }}
    className="w-full p-2 border rounded bg-white" disabled={!isEditing}
  />
  {bannerPreview && (
    <img
      src={bannerPreview}
      alt="Banner"
      className="mt-2 h-24 w-full object-cover rounded shadow" 
    />
  )}
</div>
          <div>
            <label className="block font-medium mb-1">Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full p-2 border rounded" disabled={!isEditing}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1" disabled={!isEditing}>Primary Color</label>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-10 p-0 border rounded cursor-pointer" disabled={!isEditing} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Live Theme Preview</h3>
          </div>
          <div className="md:col-span-2 mt-2 border rounded shadow p-6 relative" style={{
            backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
            color: theme === "light" ? "#111827" : "#f9fafb",
            transition: "all 0.3s ease",
            minHeight: "150px"
          }}>
            {logoPreview && <img src={logoPreview} alt="Logo" className="absolute top-4 right-4 h-12 w-auto object-contain rounded shadow" style={{ maxHeight: "60px", maxWidth: "120px" }} />}
            <div className="flex justify-center items-center h-full">
              <h1 className="text-3xl font-bold" style={{ color: primaryColor, textShadow: "1px 1px 3px rgba(0,0,0,0.2)" }}>
                {storeName || "Your Store Name"}
              </h1>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-2" style={{
              background: `linear-gradient(to right, ${primaryColor}, ${shadeColor(primaryColor, -20)})`
            }}></div>
          </div>
          

        </div>
        <div>
  
</div>

<button
          type="submit"
          className="submit-btn mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
        >
          ✅ Save Store Setup
        </button>

        {showPopup && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
            {popupMessage}
          </div>
        )}
      </form>

      {storeSaved && (
        <div className="text-center mt-10">
          <a href={`/store/${storeId}/Storetemplate`} className="view-template">
            View Template
          </a>
        </div>
      )}

      {storeSaved && !isEditing && (
        <div className="text-center mt-4">
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            ✏️ Edit Store Info
          </button>
        </div>
      )}

      
    </div>
  );
}
