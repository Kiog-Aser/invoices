"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  removeStyling?: boolean; // Add prop to control styling
}

const Modal = ({ isOpen, onClose, children, removeStyling = false }: ModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        // Apply base styling only if removeStyling is false
        className={`fixed inset-0 z-50 flex items-center justify-center ${!removeStyling ? 'bg-black bg-opacity-50' : ''}`}
        onClose={onClose}
      >
        {/* Background overlay, only if removeStyling is false */}
        {!removeStyling && (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>
        )}

        {/* Modal panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          {/* Apply default panel styling only if removeStyling is false */}
          <Dialog.Panel className={`relative transform overflow-hidden transition-all ${!removeStyling ? 'bg-white rounded-lg shadow-xl max-w-2xl w-full p-8' : 'w-full max-w-2xl'}`}>
            {/* Close button, only if removeStyling is false */}
            {!removeStyling && (
              <button
                className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default Modal;
