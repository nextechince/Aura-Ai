// android/app/src/main/java/com/auraai/receivers/BootReceiver.java
package com.auraai.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.auraai.services.VoiceWakeService;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // Start voice wake service on boot
            Intent serviceIntent = new Intent(context, VoiceWakeService.class);
            context.startForegroundService(serviceIntent);
        }
    }
}
