#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(VideoTools, "VideoTools",
           CAP_PLUGIN_METHOD(trim, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(toGif, CAPPluginReturnPromise);
)