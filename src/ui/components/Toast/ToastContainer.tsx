import { useEffect, useState } from 'react'
import { Toast } from './Toast'
import type { ToastProps } from './Toast'
import { Modal } from '../Modal/Modal'
import { LOCAL_STORAGE_KEYS } from '@/core/constants'
import { useNavigate } from 'react-router-dom'
import * as E from 'fp-ts/Either';
import type { PullMenuRequest } from '@/features/menu/models/MenuModel'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'
import { menuService } from '@/features/menu/services/MenuService'

export interface ToastContainerProps {
    toasts: ToastProps[]
    onRemoveToast: (id: string) => void
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {

    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)

    //LOCATION
    const navigate = useNavigate();

    // Whenever toasts change, check if any have title === 'Menu Changed'

    useEffect(() => {
        const hasMenuChangedToast = toasts.some(t => t.title === 'Menu Changed')

        if (hasMenuChangedToast) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.MENU_MODULE);
            setIsMenuModalOpen(true)
        }
    }, [toasts])

    if (!isMenuModalOpen) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: '36px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    pointerEvents: 'none'
                }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            pointerEvents: 'auto'
                        }}
                    >
                        <Toast
                            {...toast}
                            onClose={onRemoveToast}
                        />
                    </div>
                ))}
            </div>
        )
    }

    //#region DATA LOAD FOR ASSET MAPPING TO EACH EMPLOYEE

    const refreshMenu = async () => {

        const request: PullMenuRequest = {

            EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId ?? 0,
        };

        const response = await menuService.apiCallPullMenu(request);

        if (E.isRight(response)) {

            const menu = response.right.Data;

            LocalStorageHelper.storeMenuData(menu);

            window.dispatchEvent(new Event('menu-updated'));

        }
    };
    
    //#endregion 

    return (
        <Modal
            isOpen={isMenuModalOpen}
            onClose={() => setIsMenuModalOpen(false)}
            title="Menu Changed"
            saveText="Restart"
            size="sm"
            onSubmit={(e) => {
                e.preventDefault()
                setIsMenuModalOpen(false);
                refreshMenu()
                window.location.reload();
            }}
        >
            <div className="space-y-3">
                <p className="text-sm text-gray-700">
                    You access has been modified, please restart to use the application.
                </p>
            </div>
        </Modal>

    )
}

export default ToastContainer
