import { useState } from 'react';

import { MdEditor, MdCatalog } from "md-editor-rt"

const scrollElement = document.documentElement;

const MarkdownEditor = () => {
    const [text] = useState('# Hello Editor');
    const [id] = useState('preview-only');

    return (
        <>
            <MdEditor id={id} value={text} />
            <MdCatalog editorId={id} scrollElement={scrollElement} />
        </>
    );
}

export default MarkdownEditor;