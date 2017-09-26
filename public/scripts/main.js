let isPushEnabled = false;

if (typeof navigator.serviceWorker !== 'undefined') {
    window.addEventListener('load', function () {
        let pushButton = document.getElementById('push');
        let sendButton = document.getElementById('send');
        pushButton.addEventListener('click', function () {
            if (isPushEnabled) {
                unsubscribe();
            } else {
                subscribe();
            }
        });

        sendButton.addEventListener('click', function () {
            sendMessage();
        });

        navigator.serviceWorker.register('sw.js')
            .then(initialiseState);

    }, function (err) {
        console.log('service worker doesn\'t work', err);
    });
    setTimeout(function () {
        fetch('/posts', {
                method: 'GET',
                mode: 'cors'
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (response) {
                console.log(response);
            }, function (err) {
                console.log(err);
            });
    }, 2000);
}


function sendMessage() {
    fetch('/send')
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            console.log(response);
        });
}

function initialiseState() {
    if (typeof ServiceWorkerRegistration.prototype.showNotification === 'undefined') {
        console.warn('Notifications aren\'t support.');
        return;
    }

    if (Notification.permission === 'denied') {
        console.warn('The user has blocked notifications');
        return;
    }

    if (typeof PushManager === 'undefined') {
        console.warn('Push messaging isn\'t supported');
        return;
    }

    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            console.log(serviceWorkerRegistration);
            serviceWorkerRegistration.pushManager.getSubscription()
                .then(function (subscription) {
                    let pushButton = document.getElementById('push');
                    pushButton.disabled = false;
                    console.log(subscription);
                    if (!subscription) {
                        return;
                    }

                    sendSubscriptionToServer(subscription);

                    pushButton.textContent = 'Disable Push Messages';
                    isPushEnabled = true;
                })
                .catch(function (err) {
                    console.log('Error during getSubscription()', err);
                });


        })
        .catch(function (err) {
            console.log('Error during ready', err);
        });
}

function subscribe() {
    let pushButton = document.getElementById('push');
    pushButton.disabled = true;

    navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true
            })
            .then(function (subscription) {
                isPushEnabled = true;
                pushButton.textContent = 'Disable Push Messagess';
                pushButton.disabled = false;

                return sendSubscriptionToServer(subscription);
            })
            .catch(function (err) {
                if (Notification.permission === 'denied') {
                    console.warn('Permission for Notification is denied');
                    pushButton.disabled = true;
                } else {
                    console.error('Unable to subscribe to push', err);
                    pushButton.disabled = false;
                    pushButton.textContent = 'Enable Push Messages';
                }
            });
    });
}

function unsubscribe() {

}

function sendSubscriptionToServer(subscription) {
    console.log('Send Subscription', subscription);
}