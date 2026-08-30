# Flutter specific rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }

# Keep Flutter WebView
-keep class io.flutter.plugins.webviewflutter.** { *; }

# Keep generated classes
-keep class **.BuildConfig { *; }

# Don't warn about missing classes
-dontwarn io.flutter.**
-dontwarn androidx.**
-dontwarn okhttp3.**
-dontwarn org.json.**
-dontwarn com.google.gson.**
-dontwarn com.cashfree.pg.**
-dontwarn okio.**

# Cashfree SDK
-keep class com.cashfree.** { *; }
-dontwarn com.cashfree.**

# Supabase
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# Google sign-in
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Image loading / caching
-keep class com.bumptech.glide.** { *; }
-dontwarn com.bumptech.glide.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable implementations
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    private void readObjectNoData();
}
