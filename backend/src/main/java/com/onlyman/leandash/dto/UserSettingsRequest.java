package com.onlyman.leandash.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserSettingsRequest {

    private Boolean darkMode;
    private Boolean notificationEnabled;
    private String headerSize;
    private String headerDisplayMode;
    private List<String> hiddenHeaderItems;
    private List<String> headerOrder;
}
