import WidgetKit
import SwiftUI

// MARK: - Extensions & Theme
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

struct AppTheme {
    // Dark mode palette from app
    static let background = Color(hex: "0F0F11")
    static let surface = Color(hex: "1C1C1E")
    static let surfaceHighlight = Color(hex: "2C2C2E")
    static let text = Color(hex: "FFFFFF")
    static let textSecondary = Color(hex: "8E8E93")
    static let textTertiary = Color(hex: "48484A")
    static let accent = Color(hex: "32D74B") // Success Green
    
    // Mood colors for progress bars
    static let yearColor = Color(hex: "64D2FF") // Blue (Meh)
    static let monthColor = Color(hex: "FFD60A") // Yellow (Good)
    static let lifeColor = Color(hex: "FF2D55") // Red (Rad)
}

// MARK: - Provider & Entry
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), remainingDays: 12345, yearProgress: 0.75, monthProgress: 0.5, lifeProgress: 0.3)
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        let entry = loadData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
        let entry = loadData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    func loadData() -> SimpleEntry {
        let userDefaults = UserDefaults(suiteName: "group.com.hearttrace.app")
        let jsonString = userDefaults?.string(forKey: "widgetData")
        
        var remainingDays = 0
        var yearProgress = 0.0
        var monthProgress = 0.0
        var lifeProgress = 0.0
        
        if let json = jsonString, let data = json.data(using: .utf8) {
            do {
                if let dict = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    remainingDays = dict["remainingDays"] as? Int ?? 0
                    yearProgress = dict["yearProgress"] as? Double ?? 0.0
                    monthProgress = dict["monthProgress"] as? Double ?? 0.0
                    lifeProgress = dict["lifeProgress"] as? Double ?? 0.0
                }
            } catch {
                print("JSON Parse Error")
            }
        }
        
        return SimpleEntry(
            date: Date(),
            remainingDays: remainingDays,
            yearProgress: yearProgress,
            monthProgress: monthProgress,
            lifeProgress: lifeProgress
        )
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let remainingDays: Int
    let yearProgress: Double
    let monthProgress: Double
    let lifeProgress: Double
}

// MARK: - Views
struct HeartTraceWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        Group {
            if family == .systemSmall {
                SmallView(entry: entry)
            } else {
                MediumView(entry: entry)
            }
        }
        .containerBackground(for: .widget) {
            ZStack {
                // Premium Dark Background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(hex: "1C1C1E"), // Lighter dark at top-left
                        Color(hex: "000000")  // Pure black at bottom-right
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                // Subtle Ambient Glow (Top Left)
                GeometryReader { geo in
                    Circle()
                        .fill(
                            RadialGradient(
                                gradient: Gradient(colors: [
                                    Color.white.opacity(0.03),
                                    Color.clear
                                ]),
                                center: .topLeading,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.8
                            )
                        )
                        .position(x: 0, y: 0)
                }
            }
        }
    }
}

struct SmallView: View {
    var entry: Provider.Entry
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                // Dynamic Background Glow based on Life Progress
                Circle()
                    .fill(
                        AngularGradient(
                            gradient: Gradient(colors: [
                                AppTheme.yearColor.opacity(0.05),
                                AppTheme.lifeColor.opacity(0.05),
                                AppTheme.yearColor.opacity(0.05)
                            ]),
                            center: .center
                        )
                    )
                    .blur(radius: 15)
                    .padding(10)
                
                // Progress Ring Background
                Circle()
                    .stroke(Color.white.opacity(0.05), lineWidth: 8)
                    .padding(12)
                
                // Main Progress Ring
                Circle()
                    .trim(from: 0.0, to: CGFloat(min(entry.lifeProgress, 1.0)))
                    .stroke(
                        AngularGradient(
                            gradient: Gradient(colors: [
                                AppTheme.yearColor,
                                AppTheme.monthColor,
                                AppTheme.lifeColor
                            ]),
                            center: .center,
                            startAngle: .degrees(0),
                            endAngle: .degrees(360)
                        ),
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .rotationEffect(Angle(degrees: -90))
                    .padding(12)
                    .shadow(color: AppTheme.lifeColor.opacity(0.3), radius: 5, x: 0, y: 0)
                
                // Central Content
                VStack(spacing: 4) {
                    Text("DAYS LEFT")
                        .font(.system(size: 8, weight: .bold, design: .rounded))
                        .foregroundColor(AppTheme.textSecondary)
                        .tracking(1.0)
                    
                    Text("\(entry.remainingDays)")
                        .font(.system(size: 34, weight: .heavy, design: .rounded))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.white, .white.opacity(0.8)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 2)
                        .minimumScaleFactor(0.5)
                        .lineLimit(1)
                        .padding(.horizontal, 8)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 8))
                            .foregroundColor(AppTheme.lifeColor)
                        Text("\(Int(entry.lifeProgress * 100))%")
                            .font(.system(size: 10, weight: .bold, design: .rounded))
                            .foregroundColor(AppTheme.text)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(
                        Capsule()
                            .fill(Color.white.opacity(0.05))
                            .overlay(
                                Capsule()
                                    .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                            )
                    )
                }
            }
        }
        .padding(2) // Extra safety padding from edge
    }
}

struct MediumView: View {
    var entry: Provider.Entry
    
    var body: some View {
        HStack(spacing: 0) {
            // Left Column: Big Summary
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    ZStack {
                        Circle()
                            .fill(AppTheme.accent.opacity(0.2))
                            .frame(width: 20, height: 20)
                        Image(systemName: "hourglass")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(AppTheme.accent)
                    }
                    
                    Text("REMAINING")
                        .font(.system(size: 10, weight: .bold, design: .rounded))
                        .foregroundColor(AppTheme.textSecondary)
                        .tracking(1.5)
                }
                .padding(.bottom, 8)
                
                Text("\(entry.remainingDays)")
                    .font(.system(size: 46, weight: .heavy, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.white, Color(hex: "E5E5EA")],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 2)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                
                Text("Days Left in Life")
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundColor(AppTheme.textTertiary)
                
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 20) // More breathing room on left
            .padding(.vertical, 12)
            
            // Right Column: Progress Bars
            VStack(spacing: 12) {
                ModernProgressRow(
                    label: "Year",
                    progress: entry.yearProgress,
                    color: AppTheme.yearColor,
                    icon: "calendar"
                )
                ModernProgressRow(
                    label: "Month",
                    progress: entry.monthProgress,
                    color: AppTheme.monthColor,
                    icon: "moon.stars.fill"
                )
                ModernProgressRow(
                    label: "Life",
                    progress: entry.lifeProgress,
                    color: AppTheme.lifeColor,
                    icon: "heart.fill"
                )
            }
            .frame(width: 150)
            .padding(.trailing, 20) // More breathing room on right
            .padding(.vertical, 12)
        }
    }
}

struct ModernProgressRow: View {
    let label: String
    let progress: Double
    let color: Color
    let icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Label {
                    Text(label)
                        .font(.system(size: 11, weight: .semibold, design: .rounded))
                } icon: {
                    Image(systemName: icon)
                        .font(.system(size: 9))
                }
                .foregroundColor(AppTheme.textSecondary)
                
                Spacer()
                
                Text("\(Int(progress * 100))%")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(color)
                    .shadow(color: color.opacity(0.3), radius: 2, x: 0, y: 0)
            }
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    // Track
                    Capsule()
                        .fill(Color.white.opacity(0.08))
                        .frame(height: 6)
                    
                    // Progress with Gradient
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [color.opacity(0.8), color],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: max(geo.size.width * CGFloat(progress), 6), height: 6)
                        .shadow(color: color.opacity(0.5), radius: 2, x: 0, y: 0)
                        
                    // Shine effect on progress bar
                    Capsule()
                        .fill(Color.white.opacity(0.3))
                        .frame(width: max(geo.size.width * CGFloat(progress), 6), height: 2)
                        .offset(y: -1.5)
                        .clipShape(Capsule())
                }
            }
            .frame(height: 6)
        }
    }
}

struct HeartTraceWidget: Widget {
    let kind: String = "HeartTraceWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HeartTraceWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("心迹倒计时")
        .description("查看您的人生倒计时和时间进度。")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled() // For edge-to-edge content if needed
    }
}

