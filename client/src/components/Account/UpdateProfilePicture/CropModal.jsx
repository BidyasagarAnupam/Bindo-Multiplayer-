import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import React, { useEffect } from 'react'
import ImageCropper from './ImageCropper'

const CropModal = ({
    imageSrc,
    isOpen,
    onClose,
    onOpenChange,
    updateAvatar
}) => {
    useEffect(() => {
        console.log("Is Open ", isOpen);
    },[isOpen])
    return (
        <Modal
            isDismissable={false}
            className='dark text-foreground'
            size='lg'
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="auto"
            backdrop='blur'
            classNames={{
                wrapper: "[--slide-exit:0px]",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Crop Your Image</ModalHeader>
                        <ModalBody>
                            <ImageCropper 
                                imgSrc={imageSrc} 
                                updateAvatar={updateAvatar}
                                closeModal={onClose}
                            />

                        </ModalBody>
                    </>
                )}
            </ModalContent>

        </Modal>
    )
}

export default CropModal