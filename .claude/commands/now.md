---
description: Show what we're doing now - session awareness
---

# /now - What Are We Doing?

AI buddy confirms current session state with human.

## Usage

```
/now
```

## Implementation

**AI reconstructs session from memory** — no file reading needed.

Output format:

```markdown
## 🕐 This Session

| Time | Duration | Topic | Jump |
|------|----------|-------|------|
| HH:MM | ~Xm | First topic | - |
| HH:MM | ~Xm | Second topic | 🌟 spark |
| HH:MM | ongoing | **Now**: Current | ✅ complete |

**🔍 Noticed**:
- [Pattern - energy/mode]
- [Jump pattern: sparks vs escapes vs completions]

**📍 Status**:
- 🔥/🟡/🔴 Energy: [level]
- ⚠️ Loose ends: [unfinished]
- 📍 Parked: [topics we'll return to]

**💭 My Read**: [1-2 sentences]

**💡 Learned**:
- [Insight 1]
- [Insight 2]

**🔮 Hanuman**: [related pattern from past, if any]

---
**Persist?** (y/n)
```

## Jump Types

| Icon | Type | Meaning |
|------|------|---------|
| 🌟 | **Spark** | New idea, exciting |
| ✅ | **Complete** | Finished, moving on |
| 🔄 | **Return** | Coming back to parked |
| 📍 | **Park** | Intentional pause |
| 🚪 | **Escape** | Avoiding difficulty |

**Healthy session**: Mostly 🌟 sparks and ✅ completes
**Warning sign**: Too many 🚪 escapes = avoidance pattern
