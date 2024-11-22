async function addUnsubscribeButtons() {
    await waitForElements('ytd-channel-renderer');
    
    const channels = document.querySelectorAll('ytd-channel-renderer');
    
    channels.forEach(channel => {
        if (!channel.querySelector('.quick-unsub-btn')) {
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'quick-unsub-wrapper';
            
            const unsubButton = document.createElement('button');
            unsubButton.className = 'quick-unsub-btn';
            unsubButton.innerHTML = `
                <span class="unsub-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M20 13H4v-2h16v2z"/>
                    </svg>
                </span>
                <span class="unsub-text">Unsubscribe</span>
            `;
            
            unsubButton.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Add loading state
                unsubButton.classList.add('loading');
                
                try {
                    // Click the original subscribe button
                    const subscribeButton = channel.querySelector('ytd-subscribe-button-renderer button');
                    subscribeButton?.click();
                    await wait(100);

                    // Click unsubscribe in dropdown (using more specific selector)
                    const unsubOption = document.querySelector('tp-yt-paper-item.ytd-menu-service-item-renderer');
                    unsubOption?.click();
                    await wait(100);

                    // Automatically click confirm button
                    const confirmButton = document.querySelector('yt-button-renderer#confirm-button button');
                    confirmButton?.click();

                    // Success state
                    unsubButton.classList.remove('loading');
                    unsubButton.classList.add('unsubscribed');
                    channel.style.opacity = '0.7';
                    
                } catch (error) {
                    console.error('Unsubscribe failed:', error);
                    unsubButton.classList.remove('loading');
                }
            });
            
            buttonWrapper.appendChild(unsubButton);
            const channelInfo = channel.querySelector('#info-section');
            channelInfo.appendChild(buttonWrapper);
        }
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForElements(selector) {
    let retries = 0;
    const maxRetries = 10;
    
    while (document.querySelectorAll(selector).length === 0 && retries < maxRetries) {
        await wait(500);
        retries++;
    }
    return document.querySelectorAll(selector);
}

// Initial load
addUnsubscribeButtons();

// Handle dynamic loading of more channels
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            addUnsubscribeButtons();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Debug message
console.log('YouTube Unsubscriber script loaded');
