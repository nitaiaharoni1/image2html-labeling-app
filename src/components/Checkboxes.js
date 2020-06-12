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
        const [allCheckboxes, setAllCheckboxes] = useState(true);

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

        const toggleAllChecked = () => {
            const allTrue = { ...checkedCheckboxes };
            Object.keys(allTrue).forEach(key => {
                allTrue[key] = !allCheckboxes;
            })
            setAllCheckboxes(!allCheckboxes);
            setCheckedCheckboxes(allTrue);
        }

        return (
            <div className={styles.checkboxes}>
                <label key={'all'} className={styles.checkboxWrapper}>
                    <div style={{fontWeight: 'bold'}}>{'All'}</div>
                    <input type="checkbox" checked={allCheckboxes}
                           onChange={() => toggleAllChecked()}
                    />
                </label>
                {relevantTags.map(tag => {
                    if(!tag) return;
                    return (
                        <label key={tag} className={styles.checkboxWrapper}>
                            <div>{`${tag}`}</div>
                            <input type="checkbox" checked={checkedCheckboxes[tag]}
                                   onChange={() => toggleChecked(tag)}/>
                        </label>
                    )
                })}
            </div>
        );
    }
;

export default Checkboxes;
