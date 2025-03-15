"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface ModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

const Modal = ({ isModalOpen, setIsModalOpen, children }: ModalProps) => {
  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className={`modal ${isModalOpen ? "modal-open" : ""}`}
        onClose={() => setIsModalOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="modal-box relative w-11/12 max-w-xl mx-auto p-4 sm:p-6">
                <button
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
                
                <div className="mt-4">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
        
        <style jsx>{`
          .modal-box {
            max-height: 90vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          @media (max-width: 640px) {
            .modal-box {
              margin-top: 1rem;
              margin-bottom: 1rem;
            }
          }
        `}</style>
      </Dialog>
    </Transition>
  );
};

export default Modal;
