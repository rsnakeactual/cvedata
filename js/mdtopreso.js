// Presentation.js - A simple markdown to presentation converter
class MarkdownPresentation {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.imageUrls = new Set();
        this.isNavMinimized = false;  // Add state tracking for nav
        this.init();
    }

    async init() {
        // Parse URL parameters from hash
        const hash = window.location.hash.substring(1); // Remove the # symbol
        const params = new URLSearchParams(hash);
        const markdownFile = params.get('page');
        const slideNumber = parseInt(params.get('slide') || '1') - 1;

        if (markdownFile) {
            try {
                // Use XMLHttpRequest for local files
                const markdown = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    // Use just the filename without the full path
                    const filename = markdownFile.split('/').pop();
                    xhr.open('GET', filename, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                resolve(xhr.responseText);
                            } else {
                                reject(new Error(`Failed to load markdown file: ${xhr.statusText}`));
                            }
                        }
                    };
                    xhr.onerror = function() {
                        reject(new Error('Network error while loading markdown file'));
                    };
                    xhr.send();
                });
                
                document.body.innerHTML = markdown;
            } catch (error) {
                console.error('Error loading markdown file:', error);
                document.body.innerHTML = `<div class="error">Error loading markdown file: ${error.message}</div>`;
                return;
            }
        }

        this.parseMarkdown();
        this.prefetchImages();
        this.setupEventListeners();
        
        // Check for slide number
        if (!isNaN(slideNumber) && slideNumber >= 0 && slideNumber < this.slides.length) {
            this.renderSlide(slideNumber);
            return;
        }
        
        this.renderSlide(0);
    }

    parseMarkdown() {
        const content = document.body.innerHTML;
        
        // Extract all image URLs first
        const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;
        while ((match = imageRegex.exec(content)) !== null) {
            this.imageUrls.add(match[2]);
        }

        // Extract background image URLs
        const backgroundRegex = /background\s*\{[^}]*background-image:\s*url\(['"]([^'"]+)['"]\)/g;
        while ((match = backgroundRegex.exec(content)) !== null) {
            this.imageUrls.add(match[1]);
        }

        this.slides = content.split('---').map(slide => {
            return this.convertMarkdownToHtml(slide.trim());
        });
    }

    prefetchImages() {
        this.imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    convertMarkdownToHtml(markdown) {
        // Process lists first, before any other processing
        const processLists = (text) => {
            // First normalize all indentation to spaces
            text = text.replace(/\t/g, '    '); // Convert tabs to 4 spaces
            const lines = text.split('\n');
            let result = [];
            let currentList = null;
            let listItems = [];
            let lastIndent = 0;
            let indentStack = []; // Track indentation levels
            let currentParent = null; // Track current parent item

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const content = line.trim();
                const indent = line.length - line.trimStart().length;
                const listMatch = content.match(/^([*\-]|\d+\.)\s+(.*)/);
                
                if (listMatch) {
                    if (!currentList) {
                        currentList = {
                            isOrdered: /^\d+\./.test(listMatch[1]),
                            items: []
                        };
                    }

                    const item = {
                        content: listMatch[2],
                        nested: []
                    };

                    // Debug logging
                    console.log(`Line ${i + 1}:`);
                    console.log(`  Content: "${content}"`);
                    console.log(`  Indent: ${indent}`);
                    console.log(`  Last Indent: ${lastIndent}`);
                    console.log(`  Is Nested: ${indent > lastIndent}`);

                    // Handle indentation levels
                    if (indent > lastIndent) {
                        // This is a nested item
                        if (currentList.items.length > 0) {
                            if (!currentParent) {
                                currentParent = currentList.items[currentList.items.length - 1];
                            }
                            if (!currentParent.nested) {
                                currentParent.nested = [];
                            }
                            currentParent.nested.push(item);
                            console.log(`  Added as nested item under: "${currentParent.content}"`);
                        }
                    } else if (indent < lastIndent) {
                        // We're going back to a previous indentation level
                        currentList.items.push(item);
                        currentParent = null;
                        console.log(`  Added as top-level item (indent decreased)`);
                    } else {
                        // Same indentation level
                        if (currentParent) {
                            // If we're at the same indentation level and have a parent, add to parent's nested list
                            currentParent.nested.push(item);
                            console.log(`  Added as sibling to previous nested item`);
                        } else {
                            // If we're at the same indentation level but no parent, add to top level
                            currentList.items.push(item);
                            console.log(`  Added as top-level item (same indent)`);
                        }
                    }
                    
                    // Update indentation tracking
                    if (indent > lastIndent) {
                        indentStack.push(lastIndent);
                    } else if (indent < lastIndent) {
                        while (indentStack.length > 0 && indentStack[indentStack.length - 1] > indent) {
                            indentStack.pop();
                        }
                        currentParent = null;
                    }
                    lastIndent = indent;
                } else {
                    if (currentList) {
                        const buildList = (items, isOrdered) => {
                            const listType = isOrdered ? 'ol' : 'ul';
                            return `<${listType} class="markdown-list">${
                                items.map(item => 
                                    `<li>${item.content}${
                                        item.nested && item.nested.length > 0 
                                            ? `<ul class="markdown-list">${
                                                item.nested.map(nested => 
                                                    `<li>${nested.content}${
                                                        nested.nested && nested.nested.length > 0 
                                                            ? `<ul class="markdown-list">${
                                                                nested.nested.map(n => 
                                                                    `<li>${n.content}</li>`
                                                                ).join('')
                                                            }</ul>` 
                                                            : ''
                                                    }</li>`
                                                ).join('')
                                            }</ul>` 
                                            : ''
                                    }</li>`
                                ).join('')
                            }</${listType}>`;
                        };

                        result.push(`<div class="content-block">${buildList(currentList.items, currentList.isOrdered)}</div>`);
                        currentList = null;
                        lastIndent = 0;
                        indentStack = [];
                        currentParent = null;
                    }
                    if (content) {
                        result.push(line);
                    }
                }
            }

            // Handle any remaining list
            if (currentList) {
                const buildList = (items, isOrdered) => {
                    const listType = isOrdered ? 'ol' : 'ul';
                    return `<${listType} class="markdown-list">${
                        items.map(item => 
                            `<li>${item.content}${
                                item.nested && item.nested.length > 0 
                                    ? `<ul class="markdown-list">${
                                        item.nested.map(nested => 
                                            `<li>${nested.content}${
                                                nested.nested && nested.nested.length > 0 
                                                    ? `<ul class="markdown-list">${
                                                        nested.nested.map(n => 
                                                            `<li>${n.content}</li>`
                                                        ).join('')
                                                    }</ul>` 
                                                    : ''
                                            }</li>`
                                        ).join('')
                                    }</ul>` 
                                    : ''
                            }</li>`
                        ).join('')
                    }</${listType}>`;
                };

                result.push(`<div class="content-block">${buildList(currentList.items, currentList.isOrdered)}</div>`);
            }

            return result.join('\n');
        };

        // Process lists first, before any other processing
        let html = processLists(markdown);

        // Process code blocks
        html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<div class="content-block"><pre><code>${code.trim()}</code></pre></div>`;
        });

        // Process slide background
        html = html.replace(/^background\s*\{([^}]*)\}/gm, (match, style) => {
            return `<div class="slide-background" style="${style}"></div>`;
        });

        // Process positioned images with style block
        html = html.replace(/!\[(.*?)\]\((.*?)\)\s*\{([^}]*)\}/g, (match, alt, src, style) => {
            return `<img src="${src}" alt="${alt}" style="${style}">`;
        });

        // Process regular images without positioning
        html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
            return `<div class="content-block"><img src="${src}" alt="${alt || ''}" style="max-width: 100%; max-height: calc(100vh - 200px); width: auto; height: auto; display: block; margin: 1rem 0; object-fit: contain; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>`;
        });

        // Process positioned text blocks
        html = html.replace(/<text\s*\{([^}]*)\}>(.*?)<\/text>/gs, (match, style, content) => {
            return `<div style="position: absolute; ${style}">${this.convertMarkdownToHtml(content)}</div>`;
        });

        // Process positioned divs
        html = html.replace(/<div\s*\{([^}]*)\}>(.*?)<\/div>/gs, (match, style, content) => {
            return `<div style="position: absolute; ${style}">${this.convertMarkdownToHtml(content)}</div>`;
        });

        // Process tables
        const lines = html.split('\n');
        let inTable = false;
        let tableRows = [];
        let tableAlignments = [];
        let processedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if this is a table header
            if (line.startsWith('|') && line.endsWith('|')) {
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                }
                tableRows.push(line);
            }
            // Check if this is the separator line
            else if (inTable && line.match(/^\|[-:]+\|$/)) {
                // Process alignments
                tableAlignments = line.split('|')
                    .filter(cell => cell.trim())
                    .map(cell => {
                        if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
                        if (cell.endsWith(':')) return 'right';
                        return 'left';
                    });
            }
            // Check if this is a table row
            else if (inTable && line.startsWith('|') && line.endsWith('|')) {
                tableRows.push(line);
            }
            // End of table
            else if (inTable) {
                inTable = false;
                if (tableRows.length > 2) { // At least header, separator, and one row
                    const headerCells = tableRows[0].split('|').filter(cell => cell.trim());
                    const headerRow = `<tr>${headerCells.map((cell, i) => 
                        `<th style="text-align: ${tableAlignments[i]}">${cell.trim()}</th>`
                    ).join('')}</tr>`;

                    const bodyRows = tableRows.slice(2).map(row => {
                        const cells = row.split('|').filter(cell => cell.trim());
                        return `<tr>${cells.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`;
                    }).join('');

                    processedLines.push(`<div class="content-block"><table class="markdown-table">${headerRow}${bodyRows}</table></div>`);
                }
                processedLines.push(line);
            }
            else {
                processedLines.push(line);
            }
        }

        // Handle case where table is at the end of the content
        if (inTable && tableRows.length > 2) {
            const headerCells = tableRows[0].split('|').filter(cell => cell.trim());
            const headerRow = `<tr>${headerCells.map((cell, i) => 
                `<th style="text-align: ${tableAlignments[i]}">${cell.trim()}</th>`
            ).join('')}</tr>`;

            const bodyRows = tableRows.slice(2).map(row => {
                const cells = row.split('|').filter(cell => cell.trim());
                return `<tr>${cells.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`;
            }).join('');

            processedLines.push(`<div class="content-block"><table class="markdown-table">${headerRow}${bodyRows}</table></div>`);
        }

        html = processedLines.join('\n');

        // Convert headings and other markdown elements
        html = html
            .replace(/^# (.*$)/gm, '<div class="content-block"><h1>$1</h1></div>')
            .replace(/^## (.*$)/gm, '<div class="content-block"><h2>$1</h2></div>')
            .replace(/^### (.*$)/gm, '<div class="content-block"><h3>$1</h3></div>')
            .replace(/\[(.*?)\]\((.*?)\)(.*?)(?=\n|$)/g, '<a href="$2">$1</a>$3')
            .replace(/^(?!<[a-z])(.*$)/gm, '<div class="content-block"><p>$1</p></div>');

        // Process blockquotes after paragraph conversion
        html = html.replace(/<div class="content-block"><p>&gt; (.*?)<\/p><\/div>/g, (match, content) => {
            return `<div class="content-block"><blockquote>${content}</blockquote></div>`;
        });

        // Process formatting within div content blocks that contain plain text
        // First, process paragraphs
        html = html.replace(/<div class="content-block"><p>(.*?)<\/p><\/div>/g, (match, content) => {
            // Replace highlighted sections first
            content = content.replace(/==(.*?)==/g, '<mark>$1</mark>');
            // Then replace bold sections
            content = content.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
            // Finally replace italic sections
            content = content.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
            return `<div class="content-block"><p>${content}</p></div>`;
        });

        return html;
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault(); // Prevent default scrolling
                this.nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault(); // Prevent default scrolling
                this.previousSlide();
            }
        });

        this.createNavigationButtons();
    }

    createNavigationButtons() {
        const nav = document.createElement('div');
        nav.className = 'presentation-nav';
        if (this.isNavMinimized) {
            nav.classList.add('collapsed');
        }
        
        // Create options for the select element
        const options = Array.from({ length: this.slides.length }, (_, i) => 
            `<option value="${i + 1}">Slide ${i + 1}</option>`
        ).join('');
        
        nav.innerHTML = `
            <button id="toggleNav" class="nav-toggle">${this.isNavMinimized ? '▲' : '▼'}</button>
            <div class="nav-content">
                <button id="prevBtn" class="${this.currentSlide === 0 ? 'disabled' : ''}">Previous</button>
                <div class="slide-navigation">
                    <select id="slideSelect">
                        ${options}
                    </select>
                    <span>of ${this.slides.length}</span>
                </div>
                <button id="nextBtn" class="${this.currentSlide === this.slides.length - 1 ? 'disabled' : ''}">Next</button>
            </div>
        `;
        
        document.body.appendChild(nav);

        // Add button event listeners
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const toggleBtn = document.getElementById('toggleNav');
        
        prevBtn.addEventListener('click', () => {
            if (!prevBtn.classList.contains('disabled')) {
                this.previousSlide();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (!nextBtn.classList.contains('disabled')) {
                this.nextSlide();
            }
        });

        toggleBtn.addEventListener('click', () => {
            nav.classList.toggle('collapsed');
            this.isNavMinimized = nav.classList.contains('collapsed');
            // Update the arrow direction
            toggleBtn.textContent = this.isNavMinimized ? '▲' : '▼';
        });
        
        // Add select event listener
        const slideSelect = document.getElementById('slideSelect');
        slideSelect.addEventListener('change', (e) => {
            const newSlide = parseInt(e.target.value) - 1;
            this.renderSlide(newSlide);
        });
    }

    renderSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            document.body.innerHTML = this.slides[index];
            this.createNavigationButtons();
            document.getElementById('slideSelect').value = index + 1;
            // Restore nav state after slide change
            if (this.isNavMinimized) {
                document.querySelector('.presentation-nav').classList.add('collapsed');
            }
            
            // Update URL with current slide number while preserving page parameter
            const params = new URLSearchParams(window.location.hash.substring(1));
            const markdownFile = params.get('page');
            const newHash = markdownFile ? 
                `#page=${markdownFile}&slide=${index + 1}` :
                `#slide=${index + 1}`;
            
            if (window.location.hash !== newHash) {
                window.history.replaceState(null, '', newHash);
            }
        }
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.renderSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.renderSlide(this.currentSlide - 1);
        }
    }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        margin: 0;
        padding: 1rem;
        padding-top: 2rem;
        background: #f5f5f5;
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
        max-width: 100vw;
        max-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    h1, h2, h3 {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    /* Add container for slide content */
    body > *:not(.presentation-nav) {
        max-width: calc(100vw - 2rem);
        height: auto;
        position: relative;
        box-sizing: border-box;
        flex: 0 1 auto;
        align-self: flex-start;
    }

    h1 {
        margin-top: 0;
        padding-top: 0;
        word-wrap: break-word;
        max-width: 100%;
    }

    h2, h3 {
        word-wrap: break-word;
        max-width: 100%;
    }

    p {
        word-wrap: break-word;
        max-width: 100%;
    }

    img {
        max-width: 100%;
        height: auto;
        object-fit: contain;
    }

    /* Ensure positioned elements stay within bounds */
    [style*="position: absolute"] {
        max-width: calc(100vw - 2rem);
        max-height: calc(100vh - 6rem);
    }

    /* Ensure lists don't overflow */
    ul, ol {
        max-width: 100%;
        padding-left: 2rem;
        box-sizing: border-box;
    }

    /* Ensure links don't cause overflow */
    a {
        word-break: break-word;
    }

    /* Ensure code blocks don't overflow */
    pre, code {
        max-width: 100%;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .slide-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
    }

    .presentation-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        transition: all 0.3s ease;
    }

    .presentation-nav.collapsed {
        width: 40px;
        height: 40px;
        right: 0;
        left: auto;
        padding: 0;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .presentation-nav.collapsed .nav-content {
        display: none;
    }

    .nav-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #333;
        transition: all 0.3s ease;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .presentation-nav.collapsed .nav-toggle {
        position: static;
        transform: none;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .presentation-nav.collapsed .nav-toggle:hover {
        background: rgba(0, 0, 0, 0.05);
    }

    .nav-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;
    }

    .presentation-nav button {
        padding: 0.5rem 1rem;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s ease;
    }

    .presentation-nav button:hover:not(.disabled) {
        background: #0056b3;
    }

    .presentation-nav button.disabled {
        background: #cccccc;
        color: #666666;
        cursor: not-allowed;
        opacity: 0.7;
    }

    .slide-navigation {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-family: inherit;
    }

    #slideSelect {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
        font-size: 1rem;
        background-color: white;
        cursor: pointer;
        min-width: 100px;
    }

    #slideSelect:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    #slideSelect option {
        font-family: inherit;
        padding: 0.5rem;
    }

    /* Add styles for list groups */
    .list-container {
        margin-bottom: 1rem;
    }

    ul {
        list-style-position: inside !important;
    }

    ul li {
        margin: 0.25rem 0 !important;
    }

    h1, h2, h3 {
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.2 !important;
    }

    h1 + ul,
    h2 + ul,
    h3 + ul {
        margin-top: 0.25rem !important;
    }

    /* Override any default browser styles */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    /* Add table styles */
    .markdown-table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
    }

    .markdown-table th,
    .markdown-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    .markdown-table th {
        background-color: #f5f5f5;
        font-weight: bold;
    }

    .markdown-table tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    /* Add styles for content blocks */
    .content-block {
        margin-bottom: 1rem;
    }

    .content-block:last-child {
        margin-bottom: 0;
    }

    ul {
        list-style-position: inside !important;
    }

    ul li {
        margin: 0.25rem 0 !important;
    }

    /* Add styles for blockquotes */
    blockquote {
        border-left: 4px solid #007bff;
        margin: 1rem 0;
        padding: 0.5rem 1rem;
        background-color: rgba(0, 123, 255, 0.05);
        font-style: italic;
        color: #555;
    }

    blockquote p {
        margin: 0;
    }

    blockquote p:last-child {
        margin-bottom: 0;
    }

    /* Add styles for lists */
    .markdown-list {
        margin: 0.5rem 0;
        padding-left: 2rem;
    }

    .markdown-list ol {
        list-style-type: decimal;
    }

    .markdown-list ul {
        list-style-type: disc;
    }

    .markdown-list li {
        margin: 0.25rem 0;
    }

    .markdown-list li p {
        margin: 0;
    }

    .markdown-list ul .markdown-list {
        list-style-type: circle;
    }

    .markdown-list ul .markdown-list .markdown-list {
        list-style-type: square;
    }

    .markdown-list ol .markdown-list {
        list-style-type: lower-alpha;
    }

    .markdown-list ol .markdown-list .markdown-list {
        list-style-type: lower-roman;
    }

    /* Add error message styling */
    .error {
        color: #dc3545;
        padding: 1rem;
        margin: 1rem;
        border: 1px solid #dc3545;
        border-radius: 4px;
        background-color: #f8d7da;
    }
`;
document.head.appendChild(style);

// Initialize the presentation when the script loads
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownPresentation();
}); 