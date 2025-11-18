import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import * as E from 'fp-ts/Either';

import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import { useToast } from '@/core/hooks/useToast';
import { TncMasterService } from '@/features/tnc/services/TncMasterService';
import type { AddUpdateTncMasterRequest, TncMasterData } from '@/features/tnc/models/TncMasterModel';
import { Input } from '@/ui/components/forms';

const AddTncMaster: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {  addToast } = useToast();

  // form state
  const [moduleName, setModuleName] = useState<string>('General');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [uniquekey] = useState<string>(() => {
    
    return '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  });

  const [errors, setErrors] = useState<{ title?: string; description?: string; moduleName?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!moduleName.trim()) newErrors.moduleName = 'Module is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload: AddUpdateTncMasterRequest = {
      TermsAndConditionsMasterId: 0,
      Uniquekey: uniquekey,
      ModuleName: moduleName,
      Title: title.trim(),
      Description: description.trim()
    };

    setIsSubmitting(true);

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        // call service
        const response = await TncMasterService.apiCallAddUpdateTncMaster(payload);

        if (E.isRight(response)) {

          const saveResponse = response.right as any;

          // show toast
          addToast({
            type: 'success',
            title: (saveResponse?.SuccessMessage && saveResponse.SuccessMessage[0]) || 'Saved successfully'
          });
          const newRecord = (saveResponse?.Data && saveResponse.Data[0]) as TncMasterData | undefined;

          try {
            const returnTo = (location.state as any)?.from || -1;
            if (returnTo === -1) {
              navigate(-1);
            } else if (typeof returnTo === 'string') {
              navigate(returnTo);
            } else {
              navigate(-1);
            }
          } catch {
            navigate(-1);
          }
        } else {
          const failure = response.left;
          addToast({ type: 'error', title: failure?.message || 'Save failed' });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error?.message || 'Operation failed' });
      },
      undefined,
      'Saving Terms & Conditions...'
    );

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="p-8">
        <Loader loading={loading} title={loadingMessage}>
          <div />
        </Loader>

        {/* HEADER ROW */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Add Terms & Conditions</h1>

          {/* CROSS BUTTON */}
          <button onClick={handleCancel} className="p-2 rounded-md hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module*</label>
              <Input
                type="text"
                value={moduleName}
                onChange={e => setModuleName(e.target.value)}
                placeholder="Enter module name"
              />
              {errors.moduleName && <p className="text-red-500 text-sm mt-1">{errors.moduleName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
              <Input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter title..."
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                rows={10}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={`w-full border p-3 rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter description..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* ACTIONS - Cancel + Save button */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-white text-sm ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

    </>
  );
};

export default AddTncMaster;
