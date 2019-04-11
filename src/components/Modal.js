import React, { useEffect }  from 'react';
import './Modal.css';

export default (props) => {
    const { 
        visible = false, width, height, 
        top, left, children, className, style,
        onVisibleChange,
     } = props;
    // console.info('Modal---', { width, height });

    useEffect(() => {
        if (!visible) return;
        const div = document.createElement('div');
        div.style="position: absolute; z-index: 100; top: 0; left: 0; width: 100%; height: 100%; background: rgba(222,222,222,0.3);";
        div.onclick = () => {
            onVisibleChange(false);
        }
        document.body.appendChild(div);
        console.info('åå»ºé®ç½©')

        return () => {
            document.body.removeChild(div);
            console.info('ç§»é¤é®ç½©')
        }
    });


    return (
        <div
          className={ `modal-container ${className || ''}`}
          style={{ ...style,width, height, top, left, display: visible ? 'inline-block' : 'none'}}
        >
            {children}
        </div>
    );
}