import { useRef, useState, useEffect } from "react";
import AssignQRCode from "../AssignQRCode/AssignQRCode";
import VIP from "../VIP/VIP";
import ButtonMenu from "../ButtonMenu/ButtonMenu";
import ImageIcon from "../ImageIcon/ImageIcon";
import QRCode from "../QRCode/QRCode";
import ApplicationButton from "../ApplicationButton/ApplicationButton";
import UserInfo from "../UserInfo/UserInfo";
import Status from "../Status/Status";
import styles from "./Card.module.css";
import { useApplications } from "../../HOCs/ApplicationsContext";
import { AllowedTypesMap } from "../../HOCs/constant";
import { useNavigate } from "react-router-dom";
import { ROUTER } from "../../router.config";
import {
  approveHandler,
  assignQRCodeHandler,
  rejectHandler,
} from "../../ActionsFn/functions";

export default function Card({ card }) {
  const { selectedType, setApplications } = useApplications();

  const isApproved = selectedType === AllowedTypesMap.approved;
  const isRejected = selectedType === AllowedTypesMap.rejected;
  const isWithout = selectedType === AllowedTypesMap.without;
  const isAll = selectedType === AllowedTypesMap.all;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeDropdown);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, []);

  const handleAssignQRCode = (id) => {
    assignQRCodeHandler(id, (updatedId, qrCodeSrc) => {
      setApplications((prev) => ({
        ...prev,
        cards: prev.cards.map((card) =>
          card.id === updatedId ? { ...card, qr_code: qrCodeSrc } : card
        ),
      }));
    });
  };

  const updateApprovedState = (id) => {
    setApplications((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card.id !== id),
      without: prev.without - 1,
      approved: prev.approved + 1,
    }));
  };

  const updateApprovedStateMenu = (id) => {
    setApplications((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card.id !== id),
      rejected: prev.rejected - 1,
      approved: prev.approved + 1,
    }));
  };

  const updateRejectedState = (id) => {
    setApplications((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card.id !== id),
      without: prev.without - 1,
      rejected: prev.rejected + 1,
    }));
  };

  const updateRejectedStateMenu = (id) => {
    setApplications((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card.id !== id),
      approved: prev.approved - 1,
      rejected: prev.rejected + 1,
    }));
  };

  const changeStatus = () => {
    if (card.status === "approved") {
      rejectHandler(card.id, updateRejectedStateMenu);
    } else if (card.status === "rejected") {
      approveHandler(card.id, updateApprovedStateMenu);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.cardWrapper + " " + styles[selectedType]}>
      <div className={styles.cardContainer + " " + styles[selectedType]}>
        <div className={styles.cardContent}>
          <div className={styles.information}>
            {(isApproved || isRejected) && (
              <button
                className={styles.informationButton}
                onClick={toggleDropdown}
              >
                Действия
              </button>
            )}

            {isDropdownOpen && !isAll && (
              <div className={styles.popoverContent} ref={dropdownRef}>
                {((isApproved && card.qr_code === 0) || isRejected) && (
                  <ButtonMenu onClick={changeStatus}>
                    {card.status === "approved"
                      ? "В отклоненные"
                      : "В одобренные"}
                  </ButtonMenu>
                )}

                {isApproved && (
                  <ButtonMenu
                    onClick={() => navigate(`${ROUTER.application}/${card.id}`)}
                  >
                    Редактировать
                  </ButtonMenu>
                )}
              </div>
            )}

            {isApproved && card.vip === 1 && <VIP />}
          </div>

          <div className={styles.iconsContainer}>
            <ImageIcon
              image={card.photo ? `https://admin.eventts.ru${card.photo}` : ""}
            />

            {isApproved && card.qr_code !== 0 && (
              <QRCode image={`https://admin.eventts.ru${card.qr_code}`} />
            )}
          </div>
          <div className={styles.infoContainer}>
            <UserInfo card={card} />

            <div className={styles.buttons}>
              {isWithout && card.status === "without" && (
                <>
                  <ApplicationButton
                    type="approve"
                    onClick={() => approveHandler(card.id, updateApprovedState)}
                  >
                    Одобрить
                  </ApplicationButton>
                  <ApplicationButton
                    onClick={() => rejectHandler(card.id, updateRejectedState)}
                  >
                    Отклонить
                  </ApplicationButton>
                </>
              )}

              {(isApproved || isRejected) && <Status status={card.status} />}

              {isApproved && card.qr_code === 0 && (
                <AssignQRCode onClick={() => handleAssignQRCode(card.id)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
