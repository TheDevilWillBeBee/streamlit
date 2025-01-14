/**
 * @license
 * Copyright 2018-2021 Streamlit Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react"
import { shallow } from "src/lib/test_util"
import { TextArea as TextAreaProto } from "src/autogen/proto"
import { WidgetStateManager } from "src/lib/WidgetStateManager"

import { Textarea as UITextArea } from "baseui/textarea"
import TextArea, { Props } from "./TextArea"

jest.mock("src/lib/WidgetStateManager")

const sendBackMsg = jest.fn()

const getProps = (elementProps: Partial<TextAreaProto> = {}): Props => ({
  element: TextAreaProto.create({
    id: "1",
    label: "Label",
    default: "",
    ...elementProps,
  }),
  width: 0,
  disabled: false,
  widgetMgr: new WidgetStateManager(sendBackMsg),
})

describe("TextArea widget", () => {
  const props = getProps()
  const wrapper = shallow(<TextArea {...props} />)

  it("renders without crashing", () => {
    expect(wrapper.find(UITextArea).length).toBe(1)
  })

  it("should set widget value on did mount", () => {
    expect(props.widgetMgr.setStringValue).toHaveBeenCalledWith(
      props.element.id,
      props.element.default,
      { fromUi: false }
    )
  })

  it("should have correct className and style", () => {
    const wrappedDiv = wrapper.find("div").first()

    const { className, style } = wrappedDiv.props()
    // @ts-ignore
    const splittedClassName = className.split(" ")

    expect(splittedClassName).toContain("stTextArea")

    // @ts-ignore
    expect(style.width).toBe(getProps().width)
  })

  it("should render a label", () => {
    expect(wrapper.find("StyledWidgetLabel").text()).toBe(props.element.label)
  })

  it("should have a default value", () => {
    expect(wrapper.find(UITextArea).prop("value")).toBe(props.element.default)
  })

  it("could be disabled", () => {
    expect(wrapper.find(UITextArea).prop("disabled")).toBe(props.disabled)
  })

  it("should set widget value on blur", () => {
    const props = getProps()
    const wrapper = shallow(<TextArea {...props} />)

    // @ts-ignore
    wrapper.find(UITextArea).prop("onChange")({
      target: {
        value: "testing",
      },
    } as React.ChangeEvent<HTMLTextAreaElement>)

    // @ts-ignore
    wrapper.find(UITextArea).prop("onBlur")()

    expect(props.widgetMgr.setStringValue).toHaveBeenCalledWith(
      props.element.id,
      "testing",
      {
        fromUi: true,
      }
    )
  })

  it("should set widget value when ctrl+enter is pressed", () => {
    const props = getProps()
    const wrapper = shallow(<TextArea {...props} />)

    // @ts-ignore
    wrapper.find(UITextArea).prop("onChange")({
      target: {
        value: "testing",
      },
    } as React.ChangeEvent<HTMLTextAreaElement>)

    // @ts-ignore
    wrapper.find(UITextArea).prop("onKeyDown")({
      preventDefault: jest.fn(),
      ctrlKey: true,
      key: "Enter",
    })

    expect(props.widgetMgr.setStringValue).toHaveBeenCalledWith(
      props.element.id,
      "testing",
      {
        fromUi: true,
      }
    )
  })

  it("should set widget height if it is passed from props", () => {
    const props = getProps({
      height: 500,
    })
    const wrapper = shallow(<TextArea {...props} />)
    const overrides = wrapper.find(UITextArea).prop("overrides")

    // @ts-ignore
    const { height, resize } = overrides.Input.style

    expect(height).toBe("500px")
    expect(resize).toBe("vertical")
  })

  it("should limit the length if max_chars is passed", () => {
    const props = getProps({
      height: 500,
      maxChars: 10,
    })
    const wrapper = shallow(<TextArea {...props} />)

    // @ts-ignore
    wrapper.find(UITextArea).prop("onChange")({
      target: {
        value: "0123456789",
      },
    } as EventTarget)

    expect(wrapper.find(UITextArea).prop("value")).toBe("0123456789")

    // @ts-ignore
    wrapper.find(UITextArea).prop("onChange")({
      target: {
        value: "0123456789a",
      },
    } as EventTarget)

    expect(wrapper.find(UITextArea).prop("value")).toBe("0123456789")
  })

  describe("On mac it should", () => {
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      writable: true,
    })

    const props = getProps()
    const wrapper = shallow(<TextArea {...props} />)

    it("should set widget value when ⌘+enter is pressed", () => {
      // @ts-ignore
      wrapper.find(UITextArea).prop("onChange")({
        target: {
          value: "testing",
        },
      } as React.ChangeEvent<HTMLTextAreaElement>)

      // @ts-ignore
      wrapper.find(UITextArea).prop("onKeyDown")({
        preventDefault: jest.fn(),
        metaKey: true,
        key: "Enter",
      })

      expect(props.widgetMgr.setStringValue).toHaveBeenCalledWith(
        props.element.id,
        "testing",
        {
          fromUi: true,
        }
      )
    })
  })
})
