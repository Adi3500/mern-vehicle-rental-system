import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { categoryApi, hostVehicleApi, vehicleApi } from '../../api/endpoints';
import ConfirmModal from '../../components/common/ConfirmModal';
import ErrorState from '../../components/common/ErrorState';
import Spinner from '../../components/common/Spinner';
import VehicleForm from '../../components/forms/VehicleForm';
import { getApiError } from '../../utils/format';

const toFormData = (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'location' || key === 'features') {
            formData.append(key, JSON.stringify(value));
            return;
        }
        if (key === 'images' && Array.isArray(value)) {
            value.forEach((file) => { if (file instanceof File) formData.append('images', file); });
            return;
        }
        formData.append(key, value);
    });
    return formData;
};

export default function HostVehicleEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [categories, setCategories] = useState([]);
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [removingImageId, setRemovingImageId] = useState('');
    const [imageToRemove, setImageToRemove] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            setError('');
            try {
                const [categoryResponse, vehicleResponse] = await Promise.all([
                    categoryApi.list(),
                    isEditing ? vehicleApi.getById(id) : Promise.resolve(null),
                ]);
                setCategories(categoryResponse?.data?.data?.categories || []);
                setVehicle(vehicleResponse?.data?.data?.vehicle || null);
            } catch (apiError) {
                setError(getApiError(apiError, 'We could not load the vehicle editor.'));
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, [id, isEditing]);

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        try {
            const normalizedPayload = isEditing ? payload : { ...payload };
            if (!isEditing) delete normalizedPayload.status;
            const formData = toFormData(normalizedPayload);
            if (isEditing) {
                await hostVehicleApi.update(id, formData);
                toast.success('Vehicle updated.');
            } else {
                await hostVehicleApi.create(formData);
                toast.success('Vehicle created.');
            }
            navigate('/host/vehicles');
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not save this vehicle.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveExistingImage = async (publicId) => {
        if (!id || !publicId) return;
        setImageToRemove(publicId);
    };

    const confirmRemoveExistingImage = async () => {
        if (!id || !imageToRemove) return;
        setRemovingImageId(imageToRemove);
        try {
            const response = await hostVehicleApi.removeImage(id, imageToRemove);
            setVehicle(response.data?.data?.vehicle || null);
            toast.success('Vehicle image removed.');
            setImageToRemove('');
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not remove this image.'));
        } finally {
            setRemovingImageId('');
        }
    };

    if (loading) return <Spinner fullScreen label="Loading vehicle editor..." />;

    if (error) {
        return (<div className="page-container"><ErrorState title="Vehicle editor unavailable"
            description={error}
            action={<Link to="/host/vehicles"
                className="button button--ghost"><ArrowLeft size={15} /> Back to vehicles</Link>
            } /></div>
        );
    }

    return (<div className="page-container"><div style={
        { marginBottom: '1rem' }
    }><Link to="/host/vehicles"
        className="button button--ghost button--sm"
        style={
            { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }
        }><ArrowLeft size={14} />
            Back to vehicles </Link></div><div className="page-header"><span className="page-eyebrow"> Host workspace </span><h1> {isEditing ? 'Edit Vehicle' : 'Add Vehicle'} </h1><p> {
                isEditing ?
                    'Update your vehicle listing details, pricing, and images.' : 'Create a new vehicle listing to start accepting bookings.'
            } </p></div><div className="host-vehicle-editor__shell"><div className="card host-vehicle-editor__card"><VehicleForm categories={categories}
                    initialData={vehicle}
                    onSubmit={handleSubmit}
                    onRemoveExistingImage={handleRemoveExistingImage}
                    removingImageId={removingImageId}
                    submitting={submitting} /></div></div><ConfirmModal open={Boolean(imageToRemove)}
                        title="Remove Image"
                        message="Remove this image from the vehicle? This cannot be undone."
                        confirmLabel="Remove image"
                        confirmTone="danger"
                        onClose={
                            () => {
                                if (removingImageId) return;
                                setImageToRemove('');
                            }
                        }
                        onConfirm={confirmRemoveExistingImage}
                        disabled={Boolean(removingImageId)} /></div>
    );
}
