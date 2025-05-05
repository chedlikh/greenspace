import { useForm } from 'react-hook-form';
import { useCreateGroup } from '../../../services/group';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';

const CreateGroupForm = ({ onSuccess }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { mutate: createGroup, isLoading } = useCreateGroup();

    const onSubmit = (data) => {
        createGroup(data, {
            onSuccess: () => {
                reset();
                toast.success('Group created successfully!');
                if (onSuccess) onSuccess();
            },
            onError: (error) => {
                toast.error(`Failed to create group: ${error.message}`);
            },
        });
    };

    return (
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Group</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Group Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        {...register('name', { required: 'Group name is required' })}
                        className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Enter group name"
                    />
                    {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        {...register('description')}
                        className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        rows={4}
                        placeholder="Describe your group"
                    />
                </div>

                <div>
                    <label htmlFor="privacyLevel" className="block text-sm font-medium text-gray-700">
                        Privacy Level
                    </label>
                    <select
                        id="privacyLevel"
                        {...register('privacyLevel', { required: 'Privacy level is required' })}
                        className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        defaultValue="PUBLIC"
                    >
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                        <option value="SECRET">Secret</option>
                    </select>
                    {errors.privacyLevel && (
                        <p className="text-red-600 text-sm mt-1">{errors.privacyLevel.message}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : 'Create Group'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGroupForm;