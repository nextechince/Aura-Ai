// android/app/src/main/java/com/auraai/services/VoiceWakeService.java
package com.auraai.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import com.auraai.R;

public class VoiceWakeService extends Service {
    private static final String CHANNEL_ID = "aura_voice_channel";
    private static final int NOTIFICATION_ID = 1;
    
    private AudioRecord audioRecord;
    private boolean isRecording = false;
    private String wakeWord = "aura";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, createNotification());
        startWakeWordDetection();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Aura AI Voice Service",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Listening for 'Hey Aura'");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification createNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Aura AI")
            .setContentText("Listening for 'Hey Aura'...")
            .setSmallIcon(android.R.drawable.ic_mic_voice_search)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    private void startWakeWordDetection() {
        // Audio recording setup
        int bufferSize = AudioRecord.getMinBufferSize(
            16000,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        );

        audioRecord = new AudioRecord(
            MediaRecorder.AudioSource.MIC,
            16000,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        );

        audioRecord.startRecording();
        isRecording = true;

        // Start detection thread
        new Thread(() -> {
            byte[] buffer = new byte[bufferSize];
            while (isRecording) {
                int read = audioRecord.read(buffer, 0, buffer.length);
                if (read > 0) {
                    // Process audio for wake word
                    // This would use ML or simple energy detection
                    // For now, just detect voice activity
                    if (detectVoiceActivity(buffer)) {
                        // Wake word detected
                        onWakeWordDetected();
                    }
                }
            }
        }).start();
    }

    private boolean detectVoiceActivity(byte[] audioData) {
        // Simple energy-based voice detection
        long sum = 0;
        for (byte b : audioData) {
            sum += Math.abs(b);
        }
        long average = sum / audioData.length;
        return average > 500; // Threshold for voice detection
    }

    private void onWakeWordDetected() {
        // Wake word detected - wake up the app
        Intent intent = new Intent("com.auraai.WAKE_WORD");
        intent.putExtra("wakeWord", wakeWord);
        sendBroadcast(intent);
        
        // Also open the app if closed
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage("com.auraai");
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(launchIntent);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        isRecording = false;
        if (audioRecord != null) {
            audioRecord.stop();
            audioRecord.release();
        }
        super.onDestroy();
    }
}
