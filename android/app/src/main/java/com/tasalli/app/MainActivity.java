package com.tasalli.app;

import android.graphics.Color;
import android.graphics.Canvas;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.graphics.drawable.Drawable;
import android.os.Build;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.rgb(247, 243, 236));
        window.setNavigationBarColor(Color.WHITE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setStatusBarContrastEnforced(false);
            window.setNavigationBarContrastEnforced(false);
        }

        WindowInsetsControllerCompat controller =
            new WindowInsetsControllerCompat(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(true);
        controller.setAppearanceLightNavigationBars(true);

        if (bridge != null && bridge.getWebView() != null
                && bridge.getWebView().getParent() instanceof View root) {
            root.setBackground(new SystemBarBackgroundDrawable(root));
            ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
                var systemBars = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
                var ime = insets.getInsets(WindowInsetsCompat.Type.ime());
                v.setPadding(
                    systemBars.left,
                    systemBars.top,
                    systemBars.right,
                    Math.max(systemBars.bottom, ime.bottom)
                );
                boolean imeVisible = insets.isVisible(WindowInsetsCompat.Type.ime());
                float density = getResources().getDisplayMetrics().density;
                v.post(() -> {
                    int contentHeight = Math.max(0, v.getHeight() - v.getPaddingTop() - v.getPaddingBottom());
                    String js = String.format(
                        java.util.Locale.US,
                        "document.documentElement.style.setProperty('--app-height','%.2fpx');" +
                        "document.documentElement.classList.toggle('keyboard-open',%s);",
                        contentHeight / density,
                        imeVisible ? "true" : "false"
                    );
                    bridge.getWebView().evaluateJavascript(js, null);
                });
                return WindowInsetsCompat.CONSUMED;
            });
            ViewCompat.requestApplyInsets(root);
        }
    }

    private static final class SystemBarBackgroundDrawable extends Drawable {
        private final View root;
        private final Paint paint = new Paint();

        SystemBarBackgroundDrawable(View root) {
            this.root = root;
        }

        @Override
        public void draw(Canvas canvas) {
            var bounds = getBounds();
            paint.setColor(Color.WHITE);
            canvas.drawRect(bounds, paint);
            paint.setColor(Color.rgb(247, 243, 236));
            canvas.drawRect(
                bounds.left,
                bounds.top,
                bounds.right,
                Math.min(bounds.bottom, bounds.top + root.getPaddingTop()),
                paint
            );
        }

        @Override
        public void setAlpha(int alpha) {
            paint.setAlpha(alpha);
        }

        @Override
        public void setColorFilter(ColorFilter colorFilter) {
            paint.setColorFilter(colorFilter);
        }

        @Override
        public int getOpacity() {
            return PixelFormat.OPAQUE;
        }
    }
}
