import React from 'react'
import "./spinner.scss"

const Spinner = ({ size, color }) => {
    return (
        <div className="spinner" style={{ width: size, height: size }}>
            <div className="spinner__loader">
                <svg className="circular" viewBox="25 25 50 50">
                    <circle className="path" cx="50" cy="50" r="16" fill="none" stroke={color} strokeWidth="3" />
                </svg>
            </div>
        </div>
    )
}

export default Spinner