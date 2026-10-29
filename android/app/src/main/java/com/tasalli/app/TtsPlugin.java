package com.tasalli.app;

import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Reads Hadith Library text aloud with the phone's built-in text-to-speech engine.
 * The Android WebView has no working speechSynthesis, so the web layer calls this instead.
 */
@CapacitorPlugin(name = "TasalliTts")
public class TtsPlugin extends Plugin implements TextToSpeech.OnInitListener {

    private TextToSpeech tts;
    private volatile boolean ready = false;
    private volatile boolean failed = false;
    private final Map<String, PluginCall> pending = new ConcurrentHashMap<>();

    @Override
    public void load() {
        tts = new TextToSpeech(getContext(), this);
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) {
            failed = true;
            return;
        }
        ready = true;
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) { }

            @Override
            public void onDone(String utteranceId) {
                finish(utteranceId, false);
            }

            @Override
            public void onError(String utteranceId) {
                PluginCall call = pending.remove(utteranceId);
                if (call != null) call.reject("The phone could not read this text aloud.");
            }

            @Override
            public void onStop(String utteranceId, boolean interrupted) {
                finish(utteranceId, true);
            }
        });
    }

    private void finish(String utteranceId, boolean interrupted) {
        PluginCall call = pending.remove(utteranceId);
        if (call == null) return;
        JSObject result = new JSObject();
        result.put("interrupted", interrupted);
        call.resolve(result);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", ready);
        call.resolve(result);
    }

    @PluginMethod
    public void speak(PluginCall call) {
        if (failed || tts == null) {
            call.reject("Text-to-speech is not available. Install a voice in Android Settings → Accessibility → Text-to-speech.");
            return;
        }
        if (!ready) {
            call.reject("Text-to-speech is still starting. Please tap Listen again.");
            return;
        }
        String text = call.getString("text", "");
        Float rate = call.getFloat("rate", 1.0f);
        String lang = call.getString("lang", "en-GB");

        int langResult = tts.setLanguage(Locale.forLanguageTag(lang));
        if (langResult == TextToSpeech.LANG_MISSING_DATA || langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
            tts.setLanguage(Locale.ENGLISH);
        }
        tts.setSpeechRate(rate == null ? 1.0f : rate);

        // Resolve any earlier sentence that is about to be flushed.
        for (String id : pending.keySet()) finish(id, true);

        String id = UUID.randomUUID().toString();
        pending.put(id, call);
        int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
        if (result != TextToSpeech.SUCCESS) {
            pending.remove(id);
            call.reject("The phone could not start reading aloud.");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (tts != null) tts.stop();
        for (String id : pending.keySet()) finish(id, true);
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.handleOnDestroy();
    }
}
