import React, { useEffect, useState } from 'react';
import styles from "./Checkboxes.module.scss";

const initcheckboxes = (relevantTags) => {
    const map = {};
    for (const key of relevantTags) {
        map[key] = true;
    }
    return map;
}

const getRelevantTags = (boxes, tagNames) => {
    const tags = boxes?.map((box) => tagNames?.[box?.label])
        .filter(tag => tag).sort();
    return [...new Set(tags)]
}

const Checkboxes = ({onChecked, boxes, tagNames }) => {
        const relevantTags = getRelevantTags(boxes, tagNames);
        const [checkedCheckboxes, setCheckedCheckboxes] = useState(initcheckboxes(relevantTags));

        useEffect(() => {
            const tagsToBox = Object.keys(checkedCheckboxes).filter(tag => checkedCheckboxes[tag]);
            onChecked(tagsToBox)
        }, [JSON.stringify(checkedCheckboxes)]);

        const toggleChecked = (tag) => {
            setCheckedCheckboxes({
                ...checkedCheckboxes,
                [tag]: !checkedCheckboxes[tag]
            })
        }

        return (
            <div className={styles.checkboxes}>
                {relevantTags.map(tag => {
                    return (
                        <label key={tag} className={styles.checkboxWrapper}>
                            <div>{`${tag}`}</div>
                            <input type="checkbox" defaultChecked={true}
                                   onChange={() => toggleChecked(tag)}/>
                        </label>
                    )
                })}
            </div>
        );
    }
;

export default Checkboxes;
