"use client";

import { observer } from "mobx-react-lite";
import userStore from "@/src/app/_stores/userStore";

const SessionExpiredModal = observer(() => {
  if (!userStore.sessionExpiredMessage) {
    return null;
  }

  const handleClose = () => {
    userStore.clearSessionExpiredMessage();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* 모달창 */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <h3 className="text-lg font-bold mb-4">세션 만료 안내</h3>
        <p className="text-gray-600 mb-6">{userStore.sessionExpiredMessage}</p>
        <button
          onClick={handleClose}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          확인
        </button>
      </div>
    </div>
  );
});

export default SessionExpiredModal;
