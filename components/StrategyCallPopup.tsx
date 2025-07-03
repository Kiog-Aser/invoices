import React, { useState } from "react";
import Modal from "./Modal";
import { Transition } from "@headlessui/react";

interface StrategyCallPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategyCallPopup: React.FC<StrategyCallPopupProps> = ({ isOpen, onClose }) => {
  const [selectedCalendly, setSelectedCalendly] = useState<"kevin" | "mil">("kevin");

  const calendlyLinks: Record<"kevin" | "mil", string> = {
    kevin: "https://calendly.com/kevinokiazefanya20/systemize-writing",
    mil: "https://calendly.com/milloranh/30min",
  };

  return (
    <Transition show={isOpen}>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Book a 30-Minute Strategy Call</h2>
          <p className="mb-4">
            You can book a call with Kevin Nokia or, if his hours don't work, with Mil Hoornaert.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="calendly"
                value="kevin"
                checked={selectedCalendly === "kevin"}
                onChange={() => setSelectedCalendly("kevin")}
                className="radio radio-primary"
              />
              Kevin Nokia
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="calendly"
                value="mil"
                checked={selectedCalendly === "mil"}
                onChange={() => setSelectedCalendly("mil")}
                className="radio radio-primary"
              />
              Mil Hoornaert
            </label>
          </div>
          <iframe
            src={calendlyLinks[selectedCalendly]}
            width="100%"
            height="600"
            frameBorder="0"
            className="rounded-lg border"
            title="Calendly Booking"
          ></iframe>
        </div>
      </Modal>
    </Transition>
  );
};

export default StrategyCallPopup;
