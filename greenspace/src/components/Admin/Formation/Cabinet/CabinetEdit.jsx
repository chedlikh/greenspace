import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCabinetById, useUpdateCabinet } from '../../../../services/formation';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';

const themeColors = {
  red: { primary: '#ff3b30', secondary: '#ff2d55' },
  green: { primary: '#4cd964', secondary: '#34c759' },
  blue: { primary: '#132977', secondary: '#007aff' },
  pink: { primary: '#ff2d55', secondary: '#ff69b4' },
  yellow: { primary: '#ffcc00', secondary: '#ff9500' },
  orange: { primary: '#ff9500', secondary: '#ff7f50' },
  gray: { primary: '#8e8e93', secondary: '#a9a9a9' },
  brown: { primary: '#D2691E', secondary: '#8B4513' },
  darkgreen: { primary: '#228B22', secondary: '#006400' },
  deeppink: { primary: '#FFC0CB', secondary: '#FF69B4' },
  cadetblue: { primary: '#5f9ea0', secondary: '#4682b4' },
  darkorchid: { primary: '#9932cc', secondary: '#9400d3' },
};

const CabinetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cabinet, isLoading, error } = useCabinetById(id);
  const updateCabinet = useUpdateCabinet();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    tel: '',
    logo: '',
    catalogue: '',
    motscles: '',
    description: ''
  });
  const [logoPreview, setLogoPreview] = useState('');

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  useEffect(() => {
    if (cabinet) {
      setFormData({
        nom: cabinet.nom || '',
        adresse: cabinet.adresse || '',
        tel: cabinet.tel || '',
        logo: cabinet.logo || '',
        catalogue: cabinet.catalogue || '',
        motscles: cabinet.motscles || '',
        description: cabinet.description || ''
      });
      setLogoPreview(cabinet.logo || '');
    }
  }, [cabinet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'logo') {
      setLogoPreview(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    updateCabinet.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success('Cabinet updated successfully!');
          navigate(`/cabinets/${id}`);
        },
        onError: (error) => {
          toast.error('Update error: ' + error.message);
          console.error('Update error details:', error);
        }
      }
    );
  };

  const handleCancel = () => {
    navigate('/cabinets');
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6 transition-colors duration-300 mont-font`}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            border-image: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary)) 1;
          }
          .btn-gradient {
            background: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary));
            transition: all 0.3s ease;
          }
          .btn-gradient:hover {
            background: linear-gradient(45deg, var(--theme-secondary), var(--theme-primary));
            transform: translateY(-2px);
          }
          .input-focus:focus {
            box-shadow: 0 0 0 3px rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.5);
          }
        `}
      </style>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mont-font">Edit Cabinet</h1>
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mont-font"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`bg-white dark:bg-gray-800 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6 shadow-lg card-hover transition-all`}>
            {/* Logo Preview */}
            <div className="mb-6 flex flex-col items-center">
              {logoPreview && (
                <div className="mb-4 w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
              )}
              <div className="w-full">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="logo">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className={`w-full border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 input-focus mont-font`}
                  aria-label="Logo URL"
                />
              </div>
            </div>

            {/* Name */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="nom">
                Name
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 input-focus mont-font`}
                required
              />
            </div>

            {/* Address */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="adresse">
                Address
              </label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className={`w-full border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 input-focus mont-font`}
                rows="3"
              />
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="tel">
                Phone
              </label>
              <input
                type="tel"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                className={`w-full border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 input-focus mont-font`}
              />
            </div>

            {/* Catalogue */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="catalogue">
                Catalogue
              </label>
              <input
                type="text"
                name="catalogue"
                value={formData.catalogue}
                onChange={handleChange}
                className={`w-full border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 input-focus mont-font`}
              />
            </div>

            {/* Keywords */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="motscles">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                name="motscles"
                value={formData.motscles}
                onChange={handleChange}
                className={`w-full border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 input-focus mont-font`}
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="description">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-800'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 input-focus mont-font`}
                rows="5"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-5 py-2.5 rounded-xl border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'} mont-font font-medium transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateCabinet.isLoading}
                className={`px-5 py-2.5 btn-gradient text-white rounded-xl font-medium mont-font hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {updateCabinet.isLoading ? 'Updating...' : 'Update Cabinet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CabinetEdit;