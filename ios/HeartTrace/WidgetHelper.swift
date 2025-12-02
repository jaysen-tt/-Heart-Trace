import WidgetKit
import Foundation

@objc(WidgetHelper)
class WidgetHelper: NSObject {
  @objc
  func reloadAllTimelines() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
