import NoDataView from '@/ui/components/NoDataView/NoDataView';

const ScheduledTask = () => {

    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white rounded-xl  p-5 mt-4 h-82  overflow-y-auto thin-scroll">
                <p className="text-sm text-gray-500 font-medium mb-3">Scheduled Tasks</p>
                <div className='mt-7'>
                    <NoDataView message="No scheduled tasks" />
                </div>
            </div>
        </div>
    )
}

export default ScheduledTask