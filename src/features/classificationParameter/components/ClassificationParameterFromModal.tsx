import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import type { AddUpdateClassificationParameterRequest } from '@/features/classificationParameter/models/ClassificationParameterModel';
import { RangeSelector } from '@/ui/components/forms/RangeSelector';
import { BUDGET_TYPE_OPTIONS, COMMERCIAL_FLAT_CONFIGURATION, ENQUIRY_TIMELINE, POSSESSION_TYPE_OPTIONS, REQUIREMENT_TYPE_OPTIONS, RESIDENTIAL_FLAT_CONFIGURATION } from "@/core/constants";
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import { fetchVillageDropdown } from "@/features/technical/villageDropDown";

interface ClassificationParameterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddUpdateClassificationParameterRequest;
    onFieldChange: (field: keyof AddUpdateClassificationParameterRequest, value: any) => void;
    errors: { [k: string]: string };
    editingData: any;
    loading: boolean;
    villageDropdown: {
        selectedValues: any[];
        initialOptions: any[];
        handleChange: (values: any) => { idsString: string | null };
    }
    dropdownResetKey?:number;
}

export const ClassificationParameterFormModal: React.FC<ClassificationParameterFormModalProps> = ({
    isOpen,
    onClose,
    onCancel,
    onSubmit,
    formData,
    onFieldChange,
    errors,
    editingData,
    loading,
    villageDropdown,
    dropdownResetKey   
}) => {

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onCancel={onCancel}
            title={editingData ? 'Update Classification Parameter' : 'Add Classification Parameter'}

            onSubmit={onSubmit}
            saveText={editingData ? 'Update' : 'Add'}
            loading={loading}
            size='xl'
        >
            <div className="space-y-10 p-6 bg-blue-100">
                <div className="space-y-4" >
                    <div>
                        <RangeSelector label="Budget (In Cr)" value={String(formData.MinBudget ?? "")} onChange={(v) => onFieldChange("MinBudget", v)} options={BUDGET_TYPE_OPTIONS} error={errors.MinBudget} />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Possession Type"
                            placeholder="Select Possession Type"
                            required
                            value={formData.PossessionType ?? ""}
                            onChange={(value) => onFieldChange("PossessionType", value)}
                            options={POSSESSION_TYPE_OPTIONS.map((opt) => ({
                                label: opt.name,
                                value: opt.id,
                            }))}
                            error={errors.PossessionType}
                        />
                    </div>
                    <div>
                        <SinglePageSelection
                            label="Requirement"
                            placeholder="Select Requirement"
                            required
                            value={formData.Requirement ?? ""}

                            onChange={(item) => {

                                if (!item) {
                                    onFieldChange("RequirementType", "");
                                    return;
                                }

                                onFieldChange("Requirement", item)
                                onFieldChange("RequirementType", "");

                            }}

                            options={REQUIREMENT_TYPE_OPTIONS.map((opt) => ({
                                label: opt.name,
                                value: opt.id,
                            }))}
                            error={errors.Requirement}
                        />
                    </div>

                    {formData.Requirement && (
                        <div>
                            <SinglePageSelection
                                label={formData.Requirement === "Residential" ? "Residential Type" : formData.Requirement === "Commercial" ? "Commercial Type" : "Commercial Leasing Type"}
                                placeholder={`Select ${formData.Requirement === "Residential" ? "Residential Type" : formData.Requirement === "Commercial" ? "Commercial Type" : "Commercial Leasing Type"}`}
                                required
                                value={formData.RequirementType ?? ""}
                                onChange={(value) => onFieldChange("RequirementType", value)}
                                options={
                                    formData.Requirement === "Residential"
                                        ? RESIDENTIAL_FLAT_CONFIGURATION.map((opt) => ({
                                            label: opt.name,
                                            value: opt.id,
                                        }))
                                        : formData.Requirement === "Commercial" || formData.Requirement === "Commercial Leasing"
                                            ? COMMERCIAL_FLAT_CONFIGURATION.map((opt) => ({
                                                label: opt.name,
                                                value: opt.id,
                                            }))
                                            : []
                                }
                                error={errors.RequirementType}
                            />
                        </div>
                    )}

                    <div>
                        <MultiSelectPagination
                            label="Location"
                            key={dropdownResetKey}
                            dataFetchCallBack={fetchVillageDropdown}
                            required
                            selectedValues={villageDropdown.selectedValues}
                            options={villageDropdown.initialOptions}
                            onChange={(values) => {
                                const { idsString } = villageDropdown.handleChange(values);
                                onFieldChange("VillageMasterId", idsString || null);
                            }}
                            error={errors.VillageMasterId}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Timeline"
                            placeholder="Select Timeline"
                            required
                            value={formData.TimeLine ?? ""}
                            onChange={(value) => onFieldChange("TimeLine", value)}
                            options={ENQUIRY_TIMELINE.map((opt) => ({
                                label: opt.name,
                                value: opt.id,
                            }))}
                            error={errors.TimeLine}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
