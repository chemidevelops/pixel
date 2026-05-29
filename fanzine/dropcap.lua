local apply_dropcap = false

function Header(el)
  if el.level == 1 then
    apply_dropcap = true
  end
  return el
end

function Para(el)
  if apply_dropcap and #el.content > 0 then
    apply_dropcap = false
    local first = el.content[1]
    if first.t == "Str" and #first.text > 1 then
      local cap = first.text:sub(1, 1)
      local rest = first.text:sub(2)
      local latex = pandoc.RawInline('latex',
        '\\lettrine[lines=3,loversize=0.1,lraise=0.05]{' .. cap .. '}{' .. rest .. '}')
      el.content[1] = latex
    end
  end
  return el
end
