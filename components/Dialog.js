import Dialog from "react-native-dialog";
import { View } from "react-native";
const DialogComponent = ({ title, content, actionLabel, action, open, onClose }) => {

    return (
        <View>
            <Dialog.Container visible={open} >
                <Dialog.Title>{title}</Dialog.Title>
                {content && (
                    <Dialog.Description>
                        {content}
                    </Dialog.Description>
                )}
                <Dialog.Button label="Huỷ" onPress={onClose} />
                <Dialog.Button label={actionLabel} onPress={action} />
            </Dialog.Container>
        </View>
    );
}

export default DialogComponent