package com.fancamai.nativefilecopier;
import android.content.Context;
import java.io.File;
import java.io.FileOutputStream;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;

import com.getcapacitor.Logger;

@CapacitorPlugin(name = "NativeFileCopier")
public class NativeFileCopierPlugin extends Plugin {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }

    @PluginMethod
    public void copyFileFromWeb(PluginCall call) {
        String fileName = call.getString("fileName");
        JSArray byteArray = call.getArray("bytes");

        if (fileName == null || byteArray == null) {
            call.reject("Missing fileName or bytes");
            return;
        }

        try {
            byte[] bytes = new byte[byteArray.length()];
            for (int i = 0; i < byteArray.length(); i++) {
                bytes[i] = (byte) byteArray.getInt(i);
            }

            File outputFile = new File(getContext().getCacheDir(), fileName);
            FileOutputStream fos = new FileOutputStream(outputFile);
            fos.write(bytes);
            fos.close();

            JSObject ret = new JSObject();
            ret.put("path", outputFile.getAbsolutePath());
            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Failed to write file", e);
        }
    }


    @PluginMethod
    public void appendToFile(PluginCall call) {
        String fileName = call.getString("fileName");
        JSArray byteArray = call.getArray("bytes");
        Boolean isFirstChunk = call.getBoolean("isFirstChunk", false);

        if (fileName == null || byteArray == null) {
            call.reject("Missing fileName or bytes");
            return;
        }

        try {
            byte[] bytes = new byte[byteArray.length()];
            for (int i = 0; i < byteArray.length(); i++) {
                bytes[i] = (byte) byteArray.getInt(i);
            }

            File outputFile = new File(getContext().getCacheDir(), fileName);
            if (isFirstChunk && outputFile.exists()) {
                outputFile.delete(); // 첫 청크면 기존 파일 제거
            }

            FileOutputStream fos = new FileOutputStream(outputFile, true); // append 모드
            fos.write(bytes);
            fos.close();

            JSObject ret = new JSObject();
            ret.put("path", outputFile.getAbsolutePath());
            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Failed to write file", e);
        }
    }



    @PluginMethod
    public void deleteFile(PluginCall call) {
        String filePath = call.getString("filePath");

        if (filePath == null) {
            call.reject("Missing filePath");
            return;
        }

        try {
            File targetFile = new File(filePath);
            if (targetFile.exists()) {
                boolean deleted = targetFile.delete();
                if (deleted) {
                    JSObject ret = new JSObject();
                    ret.put("deleted", true);
                    ret.put("path", targetFile.getAbsolutePath());
                    call.resolve(ret);
                } else {
                    call.reject("Failed to delete file");
                }
            } else {
                call.reject("File not found");
            }
        } catch (Exception e) {
            call.reject("Error deleting file", e);
        }
    }



}