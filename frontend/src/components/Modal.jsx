import React from 'react';import{FiX}from'react-icons/fi';
export default function Modal({title,children,onClose}){return <div className="modal-backdrop-custom" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="sheet"><div className="sheet-head"><h3>{title}</h3><button className="close" onClick={onClose}><FiX/></button></div>{children}</div></div>}
