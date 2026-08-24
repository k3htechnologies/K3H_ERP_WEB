import React, { useState } from 'react';

type ActivityType = '' | 'redevelopment' | 'land';

export const LeadModel: React.FC = () => {
    const [activityType, setActivityType] = useState<ActivityType>('redevelopment');

    return (
        <form className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-center text-xl font-semibold mb-5">Select Property Activity</h2>

            <label className="block mb-1 font-semibold text-blue-900 text-xs">Activity Type</label>
            <select
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
            >
                <option value="">-- Select --</option>
                <option value="redevelopment">Redevelopment</option>
                <option value="land">Land</option>
            </select>

            {activityType === 'redevelopment' && <RedevelopmentForm />}
            {activityType === 'land' && <LandForm />}
        </form>
    );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="block mb-1 font-semibold text-blue-900 text-xs">{children}</label>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-black text-base font-semibold mt-4 mb-2">{children}</h3>
);

const inputCls = 'w-full p-2 mb-3 border border-gray-300 rounded';

const RedevelopmentForm: React.FC = () => {
    return (
        <div>
            <SectionTitle>Property Details</SectionTitle>
            <Label>Building Name</Label>
            <input type="text" required maxLength={200} pattern="[A-Za-z ]+" className={inputCls} />

            <Label>Building Address</Label>
            <textarea required maxLength={500} className={inputCls} />

            <Label>Country</Label>
            <select required className={inputCls}>
                <option value="">Select Country</option>
                <option value="1">India</option>
            </select>

            <Label>State</Label>
            <select required className={inputCls}>
                <option value="">Select State</option>
                <option value="1">Maharashtra</option>
            </select>

            <Label>District</Label>
            <select required className={inputCls}>
                <option value="">Select District</option>
                <option value="1">Mumbai</option>
            </select>

            <Label>City</Label>
            <select required className={inputCls}>
                <option value="">Select City</option>
                <option value="1">Mumbai</option>
            </select>

            <Label>Pin Code</Label>
            <input type="text" className={inputCls} />

            <SectionTitle>Plot Information</SectionTitle>
            <Label>Plot Number / CTS Number / Survey Number / Subdivision Number</Label>
            <input type="text" required maxLength={500} className={inputCls} />

            <Label>Ward Number / Zone</Label>
            <input type="text" required maxLength={500} className={inputCls} />

            <Label>Total Plot Area (in Sq. m.)</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Year of Original Construction</Label>
            <input type="number" className={inputCls} />

            <Label>Existing Building Type</Label>
            <select className={inputCls}>
                <option value="">Select</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed">Mixed - Use</option>
            </select>

            <Label>Number of Existing Floors</Label>
            <input type="number" className={inputCls} />

            <Label>Total Number of Existing Flats / Units</Label>
            <input type="number" className={inputCls} />

            <Label>Identification & Location</Label>
            <input type="text" required maxLength={500} className={inputCls} />

            <Label>Latitude & Longitude (For GIS Mapping)</Label>
            <input type="text" required maxLength={100} className={inputCls} />

            <SectionTitle>Society Contact</SectionTitle>
            <Label>Contact Person Name</Label>
            <input type="text" required maxLength={100} pattern="[A-Za-z ]+" className={inputCls} />

            <Label>Contact Person Mobile Number</Label>
            <input type="text" required maxLength={10} pattern="\d{10}" className={inputCls} />

            <Label>Contact Person Email</Label>
            <input type="email" required maxLength={100} className={inputCls} />

            <Label>Percentage of Member in Favor (%)</Label>
            <input type="number" step="0.01" className={inputCls} />

            <SectionTitle>Land & Plot Characteristics</SectionTitle>
            <Label>Type Of Land Tenure</Label>
            <select className={inputCls}>
                <option>Leasehold</option>
                <option>Freehold</option>
                <option>Collectors Land</option>
                <option>MHADA</option>
                <option>SRA</option>
                <option>BMC</option>
                <option>Builder</option>
            </select>

            <Label>Plot Shape</Label>
            <select className={inputCls}>
                <option>Rectangular</option>
                <option>Irregular</option>
                <option>L - Shape</option>
                <option>Circle</option>
            </select>

            <Label>Frontage (Road Facing Width)</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Depth Of the Plot</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Road Width in Front of Plot</Label>
            <input type="number" step="0.01" className={inputCls} />

            <SectionTitle>Building Structure</SectionTitle>
            <Label>Number of Existing Building / Wings</Label>
            <input type="number" className={inputCls} />

            <Label>Number of Floor Per Wings</Label>
            <input type="number" className={inputCls} />

            <Label>Total Build-Up Area</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Total Carpet Area</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Total Common Area</Label>
            <input type="number" step="0.01" className={inputCls} />

            <div className="flex gap-5 mb-4">
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Is Lift Available</label>
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Fire Safety Provisions Present</label>
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Plot under litigation/stay</label>
            </div>

            <Label>Construction Type</Label>
            <select className={inputCls}>
                <option>RCC</option>
                <option>Load - Bearing</option>
            </select>

            <SectionTitle>Additional Info</SectionTitle>
            <Label>Remarks</Label>
            <textarea maxLength={500} className={inputCls} />

            <Label>Building Photo</Label>
            <input type="file" accept="image/*" className={inputCls} />

            <label className="font-normal text-sm mb-4 block">
                <input type="checkbox" className="mr-1" /> Convense Deed
            </label>

            <div className="text-center">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    Submit
                </button>
            </div>
        </div>
    );
};

const LandForm: React.FC = () => {
    return (
        <div>
            <SectionTitle>Property Details</SectionTitle>
            <Label>Land Owner Name</Label>
            <input type="text" required maxLength={500} pattern="[A-Za-z ]+" className={inputCls} />

            <Label>Land Address</Label>
            <textarea required maxLength={500} className={inputCls} />

            <Label>Country</Label>
            <select required className={inputCls}>
                <option value="">Select Country</option>
            </select>

            <Label>State</Label>
            <select required className={inputCls}>
                <option value="">Select State</option>
            </select>

            <Label>District</Label>
            <select required className={inputCls}>
                <option value="">Select District</option>
            </select>

            <Label>City</Label>
            <select required className={inputCls}>
                <option value="">Select City</option>
            </select>

            <Label>Pin Code</Label>
            <input type="text" className={inputCls} />

            <SectionTitle>Plot Information</SectionTitle>
            <Label>Plot Number / CTS Number / Survey Number / Subdivision Number</Label>
            <input type="text" required maxLength={500} className={inputCls} />

            <Label>Ward Number / Zone</Label>
            <input type="text" required maxLength={500} className={inputCls} />

            <Label>Total Plot Area (in Sq. m.)</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Identification & Location</Label>
            <input type="text" required maxLength={500} className={inputCls} />

            <Label>Latitude & Longitude (For GIS Mapping)</Label>
            <input type="text" required maxLength={100} className={inputCls} />

            <SectionTitle>Society Contact</SectionTitle>
            <Label>Contact Person For Land Name</Label>
            <input type="text" required maxLength={100} pattern="[A-Za-z ]+" className={inputCls} />

            <Label>Contact Person Mobile Number</Label>
            <input type="text" required maxLength={10} pattern="\d{10}" className={inputCls} />

            <Label>Contact Person Email</Label>
            <input type="email" required maxLength={100} className={inputCls} />

            <SectionTitle>Land & Plot Characteristics</SectionTitle>
            <div className="flex gap-5 mb-4">
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Any Power of Attorney (POA) involved?</label>
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Fencing / Boundary Wall Present?</label>
            </div>

            <Label>Plot Shape</Label>
            <select className={inputCls}>
                <option>Rectangular</option>
                <option>Irregular</option>
                <option>L - Shape</option>
                <option>Circle</option>
            </select>

            <Label>Frontage (Road Facing Width)</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Depth Of the Plot</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Road Width in Front of Plot</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Soil Type</Label>
            <select className={inputCls}>
                <option>Clay</option>
                <option>Black Cotton</option>
                <option>Sandy</option>
                <option>Rocky</option>
            </select>

            <Label>Existing Ground Conditions</Label>
            <select className={inputCls}>
                <option>Vacant</option>
                <option>Barren</option>
                <option>Vegetation</option>
                <option>Encroachements</option>
            </select>

            <div className="flex flex-wrap gap-5 mb-4">
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Is Land Converted to Non-Agricultural?</label>
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Availability of Access Road?</label>
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Electricity Connection Nearby</label>
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Is the Plot under any litigation or stay Orders?</label>
                <label className="font-normal text-sm"><input type="checkbox" className="mr-1" /> Is 7 / 12?</label>
            </div>

            <Label>FSI Permissible (Base + TDR if allowed)</Label>
            <input type="number" step="0.01" className={inputCls} />

            <Label>Water Supply Available</Label>
            <select className={inputCls}>
                <option>Borewell</option>
                <option>Municipal</option>
            </select>

            <Label>Surrounding Land Use</Label>
            <select className={inputCls}>
                <option>Agricultural</option>
                <option>Residential</option>
                <option>Industrial</option>
                <option>Vacant</option>
            </select>

            <Label>Type Of Land Tenure</Label>
            <select className={inputCls}>
                <option>Leasehold</option>
                <option>Freehold</option>
                <option>Collectors Land</option>
                <option>MHADA</option>
                <option>SRA</option>
                <option>BMC</option>
                <option>Builder</option>
            </select>

            <Label>Land Ownership Type</Label>
            <select className={inputCls}>
                <option>Individual</option>
                <option>Joint</option>
                <option>Trust</option>
                <option>Company</option>
                <option>Government</option>
                <option>Society</option>
            </select>

            <Label>Distance From Key Landmarks</Label>
            <input type="number" step="0.01" placeholder="Nearest Town (KM)" className={inputCls} />
            <input type="number" step="0.01" placeholder="Highway (KM)" className={inputCls} />
            <input type="number" step="0.01" placeholder="Railway Station (KM)" className={inputCls} />
            <input type="number" step="0.01" placeholder="Airport (KM)" className={inputCls} />

            <Label>Total Number Of Trees on Site</Label>
            <input type="number" step="0.01" className={inputCls} />

            <SectionTitle>Additional Info</SectionTitle>
            <Label>Remarks</Label>
            <textarea maxLength={500} className={inputCls} />

            <Label>Photo</Label>
            <input type="file" accept="image/*" className={inputCls} />

            <div className="text-center">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                    Submit
                </button>
            </div>
        </div>
    );
};

export default LeadModel;
