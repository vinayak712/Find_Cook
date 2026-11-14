import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import SidebarLayout from '../../components/SidebarLayout';
import Loader from '../../components/loader';

export default function FoodGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/cook/cook-profile/me');
      setImages(res.data.foodImages || []);
    } catch (err) {
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        try {
          const res = await api.post('/cook/upload-food-image', {
            imageData: base64,
            caption: 'My Delicious Dish'
          });
          setImages(prev => [...prev, { url: res.data.url, caption: res.data.caption }]);
        } catch (err) {
          alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async (url) => {
    try {
      await api.delete('/cook/remove-food-image', {
        data: { imageUrl: url }
      });
      setImages(prev => prev.filter(img => img.url !== url));
    } catch (err) {
      alert('Failed to remove image: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCaptionChange = (index, newCaption) => {
    setImages(prev => {
      const updated = [...prev];
      updated[index].caption = newCaption;
      return updated;
    });
  };

  const saveCaptions = async () => {
    try {
      await api.post('/cook/cook-profile', { foodImages: images });
    } catch (err) {
      console.error("Failed to save captions:", err);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-on-background">Food Gallery</h1>
            <p className="text-on-surface-variant mt-1">Manage photos of your signature dishes to showcase your culinary skills.</p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
        ) : (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
              <label className="block text-sm font-bold text-on-surface-variant mb-3">Upload New Dish</label>
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${uploading ? 'border-gray-300 bg-gray-50' : 'border-primary/30 bg-primary/5 hover:bg-primary/10'}`}>
                {uploading ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm text-on-surface-variant font-bold">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">image_search</span>
                    <p className="text-sm text-on-surface-variant font-bold">Click to upload or drag and drop</p>
                    <p className="text-xs text-on-surface-variant mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Gallery Grid */}
            <div>
              <h2 className="text-lg font-bold text-on-background mb-4">Your Photos ({images.length})</h2>
              {images.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-outline-variant">
                  <div className="text-4xl mb-3">📸</div>
                  <h3 className="text-lg font-bold text-on-background mb-1">No photos yet</h3>
                  <p className="text-on-surface-variant text-sm">Upload your first dish above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="w-full h-48 bg-gray-100">
                        <img 
                          src={img.url} 
                          alt={img.caption || `Food ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 border-t border-outline-variant">
                        <input
                          type="text"
                          placeholder="Name this dish..."
                          value={img.caption || ''}
                          onChange={(e) => handleCaptionChange(idx, e.target.value)}
                          onBlur={saveCaptions}
                          className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-surface transition-colors focus:bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(img.url)}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
