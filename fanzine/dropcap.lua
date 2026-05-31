local apply_dropcap = false

function Header(el)
  if el.level == 1 then apply_dropcap = true end
  return el
end

function Para(el)
  -- Imágenes: dejar que Pandoc las convierta en <figure> normalmente
  if #el.content == 1 and el.content[1].t == "Image" then
    return el
  end

  -- Drop cap: insertar <span class="dropcap-letter"> con la primera letra
  if apply_dropcap and #el.content > 0 then
    apply_dropcap = false
    local first = el.content[1]
    if first.t == "Str" and #first.text > 1 then
      local cap = first.text:sub(1, 1)
      local rest = first.text:sub(2)
      local span = pandoc.RawInline('html',
        '<span class="dropcap-letter">' .. cap .. '</span>')
      el.content[1] = pandoc.Str(rest)
      table.insert(el.content, 1, span)
    end
    return el
  end

  return el
end
