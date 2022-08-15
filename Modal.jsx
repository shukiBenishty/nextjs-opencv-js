import { useState } from "react";
import styles from "./styles/Modal.module.css"


function Modal({ open, onClose, children }) {
    return (
        <div className={styles.modal} onClick={onClose} style={{ display: (open) ? "flex" : "none" }}>
            <div onClick={(e)=> {e.stopPropagation() }} className={styles.modalContent}>
                <div className={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;