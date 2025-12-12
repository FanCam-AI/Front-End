#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeFileCopier, "NativeFileCopier",
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(copyFileFromWeb, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(appendToFile, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(deleteFile, CAPPluginReturnPromise);
)