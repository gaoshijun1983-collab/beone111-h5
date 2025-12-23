(function() {
    // Create a debug panel
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'absolute';
    debugPanel.style.top = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.background = 'rgba(0,0,0,0.8)';
    debugPanel.style.color = '#0f0';
    debugPanel.style.padding = '10px';
    debugPanel.style.zIndex = '9999';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.pointerEvents = 'none'; 
    debugPanel.innerHTML = 'Layout Mode v2<br>Drag X/Y to position.';
    document.body.appendChild(debugPanel);

    const container = document.getElementById('app-container');
    // V6: Target individual Absolute Positioning elements
    const wrappers = document.querySelectorAll('.input-group, .submit-area'); 

    wrappers.forEach(wrapper => {
        wrapper.style.pointerEvents = 'auto';  
        wrapper.style.cursor = 'move';
        wrapper.style.border = '2px solid red'; // Strong highlight

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        const onMouseDown = (e) => {
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            startLeft = wrapper.offsetLeft;
            startTop = wrapper.offsetTop;
            wrapper.style.border = '2px solid yellow';
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            // Calculate new positions in pixels
            let newLeft = startLeft + dx;
            let newTop = startTop + dy;
            
            // Convert to percentage
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            const percentLeft = (newLeft / containerWidth) * 100;
            const percentTop = (newTop / containerHeight) * 100;
            
            wrapper.style.left = percentLeft.toFixed(2) + '%';
            wrapper.style.top = percentTop.toFixed(2) + '%';
            
            debugPanel.innerHTML = `
                Moving: FORM BLOCK<br>
                Top: ${percentTop.toFixed(1)}%<br>
                Left: ${percentLeft.toFixed(1)}%
            `;
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            wrapper.style.border = '2px solid red';
            
            let report = "FINAL COORDINATES (Copy to AI):\n";
            // Get computed or style
            const top = wrapper.style.top;
            const left = wrapper.style.left;
            report += `Form Container -> Top: ${top}, Left: ${left}\n`;
            
            console.log(report);
            alert(report); 
        };

        wrapper.addEventListener('mousedown', onMouseDown);
        wrapper.addEventListener('touchstart', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchend', onMouseUp);
        
        // Final report button
        const reportBtn = document.createElement('button');
        reportBtn.innerText = 'Get Coordinates';
        reportBtn.style.marginTop = '10px';
        reportBtn.style.display = 'block';
        reportBtn.onclick = () => {
             alert(`Form Container:\nTop: ${wrapper.style.top}\nLeft: ${wrapper.style.left}`);
        };
        debugPanel.appendChild(reportBtn);

        // Hide alignment button as it's not needed for single block
    });
})();
