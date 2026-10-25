"use client"

import { Button } from "@/components/ui/button"
import { previewWidths, type PreviewState } from "@/lib/preview-state"

import { usePreviewState } from "./preview-state-provider"

type Option<K extends keyof PreviewState> = {
  value: NonNullable<PreviewState[K]>
  label: string
  lang?: string
}

function ControlGroup<K extends keyof PreviewState>({
  name,
  label,
  options,
}: {
  name: K
  label: string
  options: Option<K>[]
}) {
  const { state, update } = usePreviewState()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1">
        {options.map((option) => {
          const pressed = state[name] === option.value
          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={pressed ? "secondary" : "ghost"}
              aria-pressed={pressed}
              lang={option.lang}
              onClick={() => update({ [name]: option.value })}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function PreviewControls() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-card px-3 py-2">
      <ControlGroup
        name="lang"
        label="Language"
        options={[
          { value: "en", label: "English" },
          { value: "ar", label: "العربية", lang: "ar" },
        ]}
      />
      <ControlGroup
        name="theme"
        label="Theme"
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />
      <ControlGroup
        name="width"
        label="Width"
        options={previewWidths.map((value) => ({
          value,
          label: value === "full" ? "Full" : value,
        }))}
      />
      <ControlGroup
        name="motion"
        label="Motion"
        options={[
          { value: "on", label: "On" },
          { value: "reduced", label: "Reduced" },
        ]}
      />
    </div>
  )
}
