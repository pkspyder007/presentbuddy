#include <napi.h>
#include "window_manager.h"

// Request accessibility permission
Napi::Value RequestPermission(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  bool result = RequestAccessibilityPermission();
  
  return Napi::Boolean::New(env, result);
}

// Minimize all windows
Napi::Value MinimizeAllWindows(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  try {
    WindowManagerResult result = MinimizeAllWindowsNative();
    
    Napi::Object resultObj = Napi::Object::New(env);
    resultObj.Set("success", Napi::Boolean::New(env, result.success));
    resultObj.Set("minimized", Napi::Number::New(env, result.minimized));
    resultObj.Set("total", Napi::Number::New(env, result.total));
    resultObj.Set("error", Napi::String::New(env, result.error));
    resultObj.Set("errorCode", Napi::String::New(env, result.errorCode));
    
    return resultObj;
  } catch (const std::exception& e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return env.Null();
  }
}

// Restore all windows
Napi::Value RestoreAllWindows(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  try {
    WindowManagerResult result = RestoreAllWindowsNative();
    
    Napi::Object resultObj = Napi::Object::New(env);
    resultObj.Set("success", Napi::Boolean::New(env, result.success));
    resultObj.Set("restored", Napi::Number::New(env, result.restored));
    resultObj.Set("total", Napi::Number::New(env, result.total));
    resultObj.Set("error", Napi::String::New(env, result.error));
    resultObj.Set("errorCode", Napi::String::New(env, result.errorCode));
    
    return resultObj;
  } catch (const std::exception& e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return env.Null();
  }
}

// Hide all apps
Napi::Value HideAllApps(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  try {
    WindowManagerResult result = HideAllAppsNative();
    
    Napi::Object resultObj = Napi::Object::New(env);
    resultObj.Set("success", Napi::Boolean::New(env, result.success));
    resultObj.Set("error", Napi::String::New(env, result.error));
    resultObj.Set("errorCode", Napi::String::New(env, result.errorCode));
    
    return resultObj;
  } catch (const std::exception& e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return env.Null();
  }
}

// Minimize specific app
Napi::Value MinimizeApp(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "Expected app name as string").ThrowAsJavaScriptException();
    return env.Null();
  }
  
  std::string appName = info[0].As<Napi::String>().Utf8Value();
  
  try {
    WindowManagerResult result = MinimizeAppNative(appName);
    
    Napi::Object resultObj = Napi::Object::New(env);
    resultObj.Set("success", Napi::Boolean::New(env, result.success));
    resultObj.Set("minimized", Napi::Number::New(env, result.minimized));
    resultObj.Set("total", Napi::Number::New(env, result.total));
    resultObj.Set("error", Napi::String::New(env, result.error));
    resultObj.Set("errorCode", Napi::String::New(env, result.errorCode));
    
    return resultObj;
  } catch (const std::exception& e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return env.Null();
  }
}

// Minimize all windows except specified app
Napi::Value MinimizeAllWindowsExcluding(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "Expected app name as string").ThrowAsJavaScriptException();
    return env.Null();
  }
  
  std::string excludeAppName = info[0].As<Napi::String>().Utf8Value();
  
  try {
    WindowManagerResult result = MinimizeAllWindowsExcludingNative(excludeAppName);
    
    Napi::Object resultObj = Napi::Object::New(env);
    resultObj.Set("success", Napi::Boolean::New(env, result.success));
    resultObj.Set("minimized", Napi::Number::New(env, result.minimized));
    resultObj.Set("total", Napi::Number::New(env, result.total));
    resultObj.Set("error", Napi::String::New(env, result.error));
    resultObj.Set("errorCode", Napi::String::New(env, result.errorCode));
    
    return resultObj;
  } catch (const std::exception& e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return env.Null();
  }
}

// Check accessibility permissions
Napi::Value CheckAccessibilityPermissions(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  bool hasPermissions = CheckAccessibilityPermissionsNative();
  
  return Napi::Boolean::New(env, hasPermissions);
}

// Initialize the addon
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "requestPermission"),
              Napi::Function::New(env, RequestPermission));
  exports.Set(Napi::String::New(env, "minimizeAllWindows"),
              Napi::Function::New(env, MinimizeAllWindows));
  exports.Set(Napi::String::New(env, "restoreAllWindows"),
              Napi::Function::New(env, RestoreAllWindows));
  exports.Set(Napi::String::New(env, "hideAllApps"),
              Napi::Function::New(env, HideAllApps));
  exports.Set(Napi::String::New(env, "minimizeApp"),
              Napi::Function::New(env, MinimizeApp));
  exports.Set(Napi::String::New(env, "minimizeAllWindowsExcluding"),
              Napi::Function::New(env, MinimizeAllWindowsExcluding));
  exports.Set(Napi::String::New(env, "checkAccessibilityPermissions"),
              Napi::Function::New(env, CheckAccessibilityPermissions));
  
  return exports;
}

NODE_API_MODULE(window_helper, Init)

