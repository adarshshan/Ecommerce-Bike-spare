let timerInterval;

        function updateTimer() {
            try {
                const timerElement = document.getElementById('countdown');
                const resendButton = document.querySelector('#resend-form input[type="submit"]');

                if (countdownTime > 0) {
                    countdownTime--;
                    const minutes = Math.floor(countdownTime / 60);
                    const seconds = countdownTime % 60;
                    timerElement.style.color = 'green';
                    timerElement.textContent = `Time remaining: ${minutes} minutes and ${seconds} seconds`;
                    // Store the remaining time in local storage
                    localStorage.setItem('otpTimerRemaining', countdownTime);
                } else {
                    clearInterval(timerInterval); // Stop the timer when it reaches 0
                    timerElement.style.color = 'red';
                    timerElement.textContent = "Time's up! Request another OTP";
                    // You can add additional actions when the timer expires, like disabling the submit button.
                    document.querySelector('input[type="submit"]').disabled = true;
                    resendButton.disabled = false; // Enable the "Resend OTP" button
                }
            } catch (error) {
                console.log(error);
                console.log('Error is here...');
            }
        }

        // Check if there's a remaining time stored in local storage
        let countdownTime = parseInt(localStorage.getItem('otpTimerRemaining')) || 60;

        // Function to handle the "Resend OTP" button click
        function resendOTP() {
            console.log('Resend OTP button clicked')
            const resendButton = document.querySelector('#resend-form input[type="submit"]');
            resendButton.disabled = true; // Disable the button when clicked

            // Here, you can implement the logic to trigger the OTP resend process on the server.
            // For example, you can make an AJAX request to resend the OTP.

            // Clear the existing timer interval
            clearInterval(timerInterval);

            // Reset the countdown time and start a new timer
            countdownTime = 60; // You can set the desired initial time
            const timerElement = document.getElementById('countdown');
            const minutes = Math.floor(countdownTime / 60);
            const seconds = countdownTime % 60;
            timerElement.textContent = `Time remaining: ${minutes} minutes and ${seconds} seconds`;
            timerInterval = setInterval(updateTimer, 1000);
        }

        // Add an event listener to the "Resend OTP" button to restart the timer
        document.getElementById('reform').addEventListener('click', async () => {
            await resendOTP();
            document.querySelector('input[type="submit"]').disabled = false;
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(),
            };
            const response = await fetch(`/users/resendtpVerficationCode`, requestOptions)
            const resBody = await response.json()
        });

        // Start the initial timer when the page loads
        document.querySelector('input[type="submit"]').disabled = false;
        const timerElement = document.getElementById('countdown');
        const minutes = Math.floor(countdownTime / 60);
        const seconds = countdownTime % 60;
        timerElement.textContent = `Time remaining: ${minutes} minutes and ${seconds} seconds`;
        timerInterval = setInterval(updateTimer, 1000);