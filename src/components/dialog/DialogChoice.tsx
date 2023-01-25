import { useRef } from "react"
import "./Dialog.css"

type SelectOptions = { options: string[], isOpenDialog: boolean, onSubmit: (option?: string) => void }

export default function DialogChoice({ options, isOpenDialog, onSubmit }: SelectOptions) {
    const selectRef = useRef<HTMLSelectElement>(null);

    const clickSubmit = () => {
        onSubmit(selectRef.current?.value as string)
    }

    return (
        <div className={`${isOpenDialog ? "dialog-container dialog-active" : "dialog-container" }`}>
            <div className={`${isOpenDialog ? "dialog-content dialog-content-show" : "dialog-content" }`}>
                <div className="dialog-content-main">
                    <div className="dialog-title">Select PHP binary</div>
                    <div className="dialog-body">
                        <select ref={selectRef} className="dialog-select">
                            {options.map(item => <option className="dialog-select-option" value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="dialog-footer">
                        <div>
                            <button onClick={clickSubmit} className="dialog-btn-submit">Submit</button>
                            <button onClick={() => onSubmit()} className="dialog-btn-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}