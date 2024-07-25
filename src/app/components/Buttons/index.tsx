import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    type: 'cancel' | 'ok';
}

const Button: React.FC<ButtonProps> = ({ type, onClick, children }) => {
    return (
        <button className={type === 'cancel' ? styles.cancelButton : styles.okButton} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;
