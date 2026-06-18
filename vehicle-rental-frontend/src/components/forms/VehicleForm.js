import { Image, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

const emptyState = {
  title: '',
  description: '',
  category: '',
  make: '',
  model: '',
  year: '',
  color: '',
  licensePlate: '',
  registrationNumber: '',
  registrationExpiryDate: '',
  pricePerDay: '',
  seats: '5',
  transmission: 'automatic',
  fuelType: 'petrol',
  status: 'active',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  featuresText: '',
};

const toFormState = (vehicle) => ({
  title: vehicle?.title || '',
  description: vehicle?.description || '',
  category: vehicle?.category?._id || vehicle?.category || '',
  make: vehicle?.make || '',
  model: vehicle?.model || '',
  year: vehicle?.year ? String(vehicle.year) : '',
  color: vehicle?.color || '',
  licensePlate: vehicle?.licensePlate || '',
  registrationNumber: vehicle?.registrationNumber || '',
  registrationExpiryDate: vehicle?.registrationExpiryDate ? vehicle.registrationExpiryDate.slice(0, 10) : '',
  pricePerDay: vehicle?.pricePerDay ? String(vehicle.pricePerDay) : '',
  seats: vehicle?.seats ? String(vehicle.seats) : '5',
  transmission: vehicle?.transmission || 'automatic',
  fuelType: vehicle?.fuelType || 'petrol',
  status: vehicle?.status || 'active',
  address: vehicle?.location?.address || '',
  city: vehicle?.location?.city || '',
  state: vehicle?.location?.state || '',
  country: vehicle?.location?.country || '',
  zipCode: vehicle?.location?.zipCode || '',
  featuresText: Array.isArray(vehicle?.features) ? vehicle.features.join(', ') : '',
});

export default function VehicleForm({
  onSubmit,
  categories = [],
  initialData = null,
  submitting = false,
  onRemoveExistingImage,
  removingImageId = '',
}) {
  const [formData, setFormData] = useState(initialData ? toFormState(initialData) : emptyState);
  const [selectedImages, setSelectedImages] = useState([]);
  const [licenseDocument, setLicenseDocument] = useState(null);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    setFormData(initialData ? toFormState(initialData) : emptyState);
    setSelectedImages([]);
    setLicenseDocument(null);
  }, [initialData]);

  useEffect(() => {
    const previews = selectedImages.map((file) => ({
      key: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewImagePreviews(previews);

    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedImages]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setSelectedImages((prev) => [...prev, ...files].slice(0, 10));
    event.target.value = '';
  };

  const handleRemoveSelectedImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleLicenseDocumentChange = (event) => {
    setLicenseDocument(event.target.files?.[0] || null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      make: formData.make.trim(),
      model: formData.model.trim(),
      year: formData.year ? Number(formData.year) : undefined,
      color: formData.color.trim(),
      licensePlate: formData.licensePlate.trim(),
      registrationNumber: formData.registrationNumber.trim(),
      registrationExpiryDate: formData.registrationExpiryDate || undefined,
      pricePerDay: Number(formData.pricePerDay),
      seats: Number(formData.seats),
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      status: formData.status,
      images: selectedImages,
      licenseDocument,
      location: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        zipCode: formData.zipCode.trim(),
      },
      features: formData.featuresText
        .split(',')
        .map((feature) => feature.trim())
        .filter(Boolean),
    });
  };

  const existingImages = Array.isArray(initialData?.images) ? initialData.images : [];
  const selectedImageSummary = selectedImages.length
    ? `${selectedImages.length} image${selectedImages.length === 1 ? '' : 's'} ready to upload`
    : 'PNG, JPG, or WEBP • up to 10 files';

  return (
    <form onSubmit={handleSubmit} className="vehicle-form">
      <div className="form-group">
        <label className="form-label" htmlFor="title">Vehicle Title</label>
        <input
          id="title"
          type="text"
          className="form-control"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Tesla Model 3 Long Range"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          className="form-control"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the vehicle, condition, and what makes it great for renters."
          minLength={20}
          required
        />
      </div>

      <div className="vehicle-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <select
            id="category"
            className="form-control"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pricePerDay">Price Per Day ($)</label>
          <input
            id="pricePerDay"
            type="number"
            className="form-control"
            name="pricePerDay"
            value={formData.pricePerDay}
            onChange={handleChange}
            min="1"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="seats">Seats</label>
          <input
            id="seats"
            type="number"
            className="form-control"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            min="1"
            max="50"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="status">Status</label>
          <select
            id="status"
            className="form-control"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="vehicle-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="make">Make</label>
          <input
            id="make"
            type="text"
            className="form-control"
            name="make"
            value={formData.make}
            onChange={handleChange}
            placeholder="Tesla"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="model">Model</label>
          <input
            id="model"
            type="text"
            className="form-control"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Model 3"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="year">Year</label>
          <input
            id="year"
            type="number"
            className="form-control"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1990"
            max="2100"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="color">Color</label>
          <input
            id="color"
            type="text"
            className="form-control"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Midnight Silver"
          />
        </div>
      </div>

      <div className="vehicle-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="transmission">Transmission</label>
          <select
            id="transmission"
            className="form-control"
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fuelType">Fuel Type</label>
          <select
            id="fuelType"
            className="form-control"
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
            <option value="cng">CNG</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="licensePlate">License Plate</label>
          <input
            id="licensePlate"
            type="text"
            className="form-control"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="MH 12 AB 1234"
            pattern="[A-Za-z]{2}[ -]?[0-9]{1,2}[ -]?[A-Za-z]{1,3}[ -]?[0-9]{1,4}"
            title="Enter a valid plate, for example MH 12 AB 1234"
          />
        </div>
      </div>

      <div className="vehicle-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="registrationNumber">Registration Number</label>
          <input
            id="registrationNumber"
            type="text"
            className="form-control"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="Vehicle registration certificate number"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="registrationExpiryDate">Registration Expiry</label>
          <input
            id="registrationExpiryDate"
            type="date"
            className="form-control"
            name="registrationExpiryDate"
            value={formData.registrationExpiryDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="licenseDocument">Vehicle License Document</label>
          <input
            id="licenseDocument"
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleLicenseDocumentChange}
          />
          <p className="vehicle-form__helper">
            {licenseDocument ? licenseDocument.name : 'Upload a vehicle RC/license image for admin review.'}
          </p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="featuresText">Features</label>
        <input
          id="featuresText"
          type="text"
          className="form-control"
          name="featuresText"
          value={formData.featuresText}
          onChange={handleChange}
          placeholder="Bluetooth, GPS, Heated seats"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="vehicleImages">Vehicle Images</label>
        <div className="upload-field">
          <input
            id="vehicleImages"
            type="file"
            className="upload-field__input"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <label className="upload-field__label" htmlFor="vehicleImages">
            <span className="upload-field__icon">
              <Image size={18} />
            </span>
            <span className="upload-field__content">
              <span className="upload-field__title">Add high-quality listing photos</span>
              <span className="upload-field__meta">{selectedImageSummary}</span>
            </span>
            <span className="upload-field__action">
              <Upload size={16} />
              Choose files
            </span>
          </label>
        </div>
        <p className="vehicle-form__helper">
          Upload up to 10 JPG, PNG, or WEBP images. New files will be added to the listing.
        </p>
      </div>

      {existingImages.length > 0 ? (
        <div className="vehicle-form__section">
          <div className="section-heading">
            <div className="section-heading__content">
              <h3>Current Images</h3>
              <p className="muted-text">Manage the images already attached to this vehicle.</p>
            </div>
          </div>

          <div className="vehicle-form__image-grid">
            {existingImages.map((image) => (
              <article key={image.publicId || image.url} className="vehicle-form__image-card">
                <div className="vehicle-form__image-frame">
                  <img src={image.url} alt={formData.title || 'Vehicle'} />
                </div>
                <div className="vehicle-form__image-actions">
                  <span className="muted-text">Uploaded image</span>
                  {image.publicId && onRemoveExistingImage ? (
                    <button
                      type="button"
                      className="button button--danger"
                      onClick={() => onRemoveExistingImage(image.publicId)}
                      disabled={removingImageId === image.publicId || submitting}
                    >
                      {removingImageId === image.publicId ? 'Removing...' : 'Remove'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {newImagePreviews.length > 0 ? (
        <div className="vehicle-form__section">
          <div className="section-heading">
            <div className="section-heading__content">
              <h3>New Image Selection</h3>
              <p className="muted-text">These files will upload when you save the vehicle.</p>
            </div>
          </div>

          <div className="vehicle-form__image-grid">
            {newImagePreviews.map((image, index) => (
              <article key={image.key} className="vehicle-form__image-card">
                <div className="vehicle-form__image-frame">
                  <img src={image.previewUrl} alt={image.name} />
                </div>
                <div className="vehicle-form__image-actions">
                  <span className="muted-text">{image.name}</span>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => handleRemoveSelectedImage(index)}
                    disabled={submitting}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="vehicle-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="address">Address</label>
          <input
            id="address"
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main Street"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            className="form-control"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="San Francisco"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="state">State</label>
          <input
            id="state"
            type="text"
            className="form-control"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="California"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="country">Country</label>
          <input
            id="country"
            type="text"
            className="form-control"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="United States"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="zipCode">Zip Code</label>
        <input
          id="zipCode"
          type="text"
          className="form-control"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="94107"
        />
      </div>

      <button type="submit" className="button button--primary btn-block" disabled={submitting}>
        {submitting ? 'Saving Vehicle...' : initialData ? 'Update Vehicle' : 'Add Vehicle'}
      </button>
    </form>
  );
}
