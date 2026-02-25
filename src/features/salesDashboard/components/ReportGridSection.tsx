
import { File, FileBraces, User2, FileChartColumnIncreasing, Star, CircleX } from 'lucide-react';

const reports = [
  { title: "Enquiry Report", desc: "Monthly trends", icon: <File className="w-5 h-5" />, color: "bg-[#E0F7FA]", iconColor: "text-[#00BCD4]" },
  { title: "Source Report", desc: "Lead sources", icon: <FileBraces className="w-5 h-5" />, color: "bg-[#E8F5E9]", iconColor: "text-[#4CAF50]" },
  { title: "CP Report", desc: "Channel Partner metrics", icon: <User2 className="w-5 h-5" />, color: "bg-[#FFF3E0]", iconColor: "text-[#FF9800]" },
  { title: "Booking Report", desc: "Revenue details", icon: <FileChartColumnIncreasing className="w-5 h-5" />, color: "bg-[#F3E5F5]", iconColor: "text-[#9C27B0]" },
  { title: "Closing Report", desc: "Conversion rates", icon: <CircleX className="w-5 h-5" />, color: "bg-[#FCE4EC]", iconColor: "text-[#E91E63]" },
  { title: "Sales Advisor", icon: <Star className="w-5 h-5" />, desc: "Performance", color: "bg-[#E3F2FD]", iconColor: "text-[#2196F3]" },
];

export default function ReportsSection() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[380px] max-w-md">
      <div className="grid grid-cols-2">
        {reports.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-2">
            <div className={`w-12 h-12 ${item.color} ${item.iconColor} flex items-center justify-center rounded-lg mb-2 text-xl`}>
              {item.icon}
            </div>
            <p className="text-[15px] font-semibold text-gray-600 leading-tight">
              {item.title}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}