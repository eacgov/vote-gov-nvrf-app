import { Button, Icon } from "@trussworks/react-uswds";

function NextButton(props) {
  return (
    <>
      <Button
        className={"maxw-mobile-lg width-full tablet:width-auto"}
        data-test="nextBtn"
        type={props.type}
        onClick={props.onClick}
      >
        <span>{props.text}</span>
        <Icon.ArrowForward
          role="none"
          aria-hidden="true"
          alt=""
          style={{ margin: "-3px -3px -3px 4px" }}
        />
      </Button>
    </>
  );
}

export default NextButton;
