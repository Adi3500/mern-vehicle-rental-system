import { useEffect, useState } from 'react';
import { Camera, Check, FileText, Pencil, Upload, User, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateProfile } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { formatDate } from '../../utils/format';

const fieldLabel = {
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '0.35rem',
};

const sectionLabel = {
  fontSize: 'var(--font-size-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--chrome-500)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '1rem',
  fontFamily: 'var(--font-mono)',
};

const toDateInputValue = (value) => (value ? value.slice(0, 10) : '');

const getProfileState = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  street: user?.address?.street || '',
  city: user?.address?.city || '',
  state: user?.address?.state || '',
  country: user?.address?.country || '',
  zipCode: user?.address?.zipCode || '',
  licenseNumber: user?.driversLicense?.licenseNumber || '',
  issuingState: user?.driversLicense?.issuingState || '',
  expiryDate: toDateInputValue(user?.driversLicense?.expiryDate),
  avatar: null,
  licenseDocument: null,
});

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(getProfileState(user));
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatarName, setSelectedAvatarName] = useState('');
  const [selectedLicenseName, setSelectedLicenseName] = useState('');

  useEffect(() => {
    if (!user) return;
    setProfileData(getProfileState(user));
    setSelectedAvatarName('');
    setSelectedLicenseName('');
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value, files } = event.target;

    if (files) {
      const file = files[0] || null;
      if (name === 'avatar') setSelectedAvatarName(file?.name || '');
      if (name === 'licenseDocument') setSelectedLicenseName(file?.name || '');
      setProfileData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append('name', profileData.name);
    payload.append('phone', profileData.phone);
    payload.append(
      'address',
      JSON.stringify({
        street: profileData.street,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        zipCode: profileData.zipCode,
      }),
    );
    payload.append(
      'driversLicense',
      JSON.stringify({
        licenseNumber: profileData.licenseNumber,
        issuingState: profileData.issuingState,
        expiryDate: profileData.expiryDate || null,
      }),
    );

    if (profileData.avatar) payload.append('avatar', profileData.avatar);
    if (profileData.licenseDocument) payload.append('licenseDocument', profileData.licenseDocument);

    try {
      await dispatch(updateProfile(payload)).unwrap();
      toast.success('Profile updated.');
      setIsEditing(false);
      setSelectedAvatarName('');
      setSelectedLicenseName('');
    } catch (error) {
      toast.error(error.message || error || 'An error occurred');
    }
  };

  const handleCancelEdit = () => {
    setProfileData(getProfileState(user));
    setSelectedAvatarName('');
    setSelectedLicenseName('');
    setIsEditing(false);
  };

  const roleLabel = user?.role
    ? { admin: 'Administrator', host: 'Host', customer: 'Customer' }[user.role] || user.role
    : '';
  const licenseStatus = user?.driversLicense?.status || 'not_submitted';
  const isSaving = status === 'loading';

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-eyebrow">Account</span>
        <h1>My Profile</h1>
        <p>Manage your profile and driver-license verification details.</p>
      </div>

      <div className="profile-page__shell">
        <div className="card profile-page__card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '1.25rem',
              margin: '-1.5rem -1.5rem 1.5rem',
              background: 'linear-gradient(90deg, rgba(201,184,50,0.07) 0%, transparent 100%)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '50%',
                background: 'var(--gold-dim)',
                border: '2px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={20} style={{ color: 'var(--chrome-400)' }} />
              )}
            </div>

            <div>
              <strong
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {user?.name}
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info">{roleLabel}</span>
                <span className="muted-text" style={{ fontSize: 'var(--font-size-xs)' }}>{user?.email}</span>
                <span className="badge badge-warning">License: {licenseStatus.replace('_', ' ')}</span>
              </div>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              {!isEditing ? (
                <button type="button" className="button button--ghost button--sm" onClick={() => setIsEditing(true)}>
                  <Pencil size={13} />
                  Edit profile
                </button>
              ) : null}
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <p style={sectionLabel}>Personal information</p>
            <div className="profile-page__personal-layout">
              <div className="profile-page__fields-grid">
                <div className="profile-page__field profile-page__field--full">
                  <label style={fieldLabel} htmlFor="name">Full name</label>
                  <input id="name" type="text" className="form-control" name="name" value={profileData.name} onChange={handleProfileChange} disabled={!isEditing} />
                </div>

                <div className="profile-page__field">
                  <label style={fieldLabel} htmlFor="email">Email address</label>
                  <input id="email" type="email" className="form-control" name="email" value={profileData.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>

                <div className="profile-page__field">
                  <label style={fieldLabel} htmlFor="phone">Phone number</label>
                  <input id="phone" type="tel" className="form-control" name="phone" value={profileData.phone} onChange={handleProfileChange} disabled={!isEditing} />
                </div>
              </div>

              <div className="profile-page__avatar-field">
                <label style={fieldLabel} htmlFor="avatar">Avatar image</label>
                <div className="upload-field upload-field--stacked">
                  <input id="avatar" type="file" className="upload-field__input" name="avatar" accept="image/*" onChange={handleProfileChange} disabled={!isEditing} />
                  <label className={`upload-field__label${!isEditing ? ' is-disabled' : ''}`} htmlFor="avatar">
                    <span className="upload-field__icon"><Camera size={18} /></span>
                    <span className="upload-field__content">
                      <span className="upload-field__title">{isEditing ? 'Choose a profile photo' : 'Enable editing to update your avatar'}</span>
                      <span className="upload-field__meta">{selectedAvatarName || 'PNG, JPG, or WEBP'}</span>
                    </span>
                    <span className="upload-field__action"><Upload size={16} />Choose file</span>
                  </label>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.25rem 0' }} />

            <p style={sectionLabel}>Driver license verification</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={fieldLabel} htmlFor="licenseNumber">License number</label>
                <input
                  id="licenseNumber"
                  type="text"
                  className="form-control"
                  name="licenseNumber"
                  value={profileData.licenseNumber}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  placeholder="MH1420110012345"
                  pattern="[A-Za-z]{2}[0-9]{2}[ -]?[0-9]{11}"
                  title="Enter a valid license number, for example MH1420110012345"
                />
              </div>
              <div>
                <label style={fieldLabel} htmlFor="issuingState">Issuing state</label>
                <input id="issuingState" type="text" className="form-control" name="issuingState" value={profileData.issuingState} onChange={handleProfileChange} disabled={!isEditing} placeholder="Maharashtra" />
              </div>
              <div>
                <label style={fieldLabel} htmlFor="expiryDate">Expiry date</label>
                <input id="expiryDate" type="date" className="form-control" name="expiryDate" value={profileData.expiryDate} onChange={handleProfileChange} disabled={!isEditing} />
              </div>
            </div>

            <div className="upload-field" style={{ marginBottom: '1rem' }}>
              <input id="licenseDocument" type="file" className="upload-field__input" name="licenseDocument" accept="image/*" onChange={handleProfileChange} disabled={!isEditing} />
              <label className={`upload-field__label${!isEditing ? ' is-disabled' : ''}`} htmlFor="licenseDocument">
                <span className="upload-field__icon"><FileText size={18} /></span>
                <span className="upload-field__content">
                  <span className="upload-field__title">Driver license document</span>
                  <span className="upload-field__meta">{selectedLicenseName || user?.driversLicense?.imageUrl ? selectedLicenseName || 'Document already submitted' : 'Upload a license image'}</span>
                </span>
                <span className="upload-field__action"><Upload size={16} />Choose file</span>
              </label>
            </div>
            {user?.driversLicense?.verifiedAt ? (
              <p className="muted-text">Verified on {formatDate(user.driversLicense.verifiedAt)}</p>
            ) : null}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '1.25rem 0' }} />

            <p style={sectionLabel}>Address</p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={fieldLabel} htmlFor="street">Street address</label>
              <input id="street" type="text" className="form-control" name="street" value={profileData.street} onChange={handleProfileChange} disabled={!isEditing} placeholder="123 Main St" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { id: 'city', label: 'City', placeholder: 'Mumbai' },
                { id: 'state', label: 'State', placeholder: 'Maharashtra' },
                { id: 'country', label: 'Country', placeholder: 'India' },
                { id: 'zipCode', label: 'ZIP / Postal code', placeholder: '400001' },
              ].map(({ id, label, placeholder }) => (
                <div key={id}>
                  <label style={fieldLabel} htmlFor={id}>{label}</label>
                  <input id={id} type="text" className="form-control" name={id} value={profileData[id]} onChange={handleProfileChange} disabled={!isEditing} placeholder={placeholder} />
                </div>
              ))}
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="submit" className="button button--primary" disabled={isSaving}>
                  <Check size={14} />
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" className="button button--ghost" onClick={handleCancelEdit}>
                  <X size={14} />
                  Cancel
                </button>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
